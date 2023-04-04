import React, { useState, useEffect } from "react";
import {
  Button,
  Dropdown,
  Menu,
  Space,
  Table,
  DatePicker,
  notification,
  Modal,
  Select,
  Input,
  Divider,
} from "antd";
import {
  DownOutlined,
  LayoutOutlined,
  OrderedListOutlined,
  RollbackOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import {
  apiCall,
  getDateObject,
  getStatusColor,
  printAmount,
  ReportError,
} from "../../helpers";
import { NavLink, useNavigate } from "react-router-dom";
import StatusTag from "./snippets/StatusTag";
import { useAuthHeader } from "react-auth-kit";
import getSymbolFromCurrency from "currency-symbol-map";
import moment from "moment";
const { RangePicker } = DatePicker;
const { Option } = Select;
const hdate = require("human-date");

const changeStatus = (
  new_status,
  invoice_id,
  auth_token,
  fetchInvoices,
  navigate
) => {
  apiCall(
    `/invoices/update/${new_status}`,
    { invoice_id },
    (response) => {
      if (response.status == 200) fetchInvoices();
      else {
        ReportError(response);
      }
    },
    auth_token,
    null,
    navigate
  );
};

const changeLabel = (
  new_status,
  invoice_id,
  auth_token,
  fetchInvoices,
  navigate,
  waiver_amount,
  voucher_id
) => {
  if (!waiver_amount) waiver_amount = 0;
  if (!voucher_id) voucher_id = null;
  apiCall(
    `/invoices/update/label/${new_status}`,
    { invoice_id, waiver_amount, voucher_id },
    (response) => {
      if (response.status == 200) fetchInvoices();
      else {
        ReportError(response);
      }
    },
    auth_token,
    null,
    navigate
  );
};

const statusLabels = {
  paid: "Paid",
  draft: "Draft",
  invoiced_in_error: "Invoiced in error",
  waiver: "Waiver",
  voucher: "Voucher",
  refund: "Refund",
  uncollectible: "Uncollectible",
  open: "Open",
};

const statusFilters = [
  {
    text: "Draft",
    value: "draft",
  },
  {
    text: "Invoiced in error",
    value: "invoiced_in_error",
  },
  {
    text: "Waiver",
    value: "waiver",
  },
  {
    text: "Voucher",
    value: "voucher",
  },
  {
    text: "Refund",
    value: "refund",
  },
  {
    text: "Uncollectible",
    value: "uncollectible",
  },
  {
    text: "Open",
    value: "open",
  },
  {
    text: "Paid",
    value: "paid",
  },
];

const createChangeStatusMenuItem = (
  menuKey,
  status,
  invoice_id,
  auth_token,
  fetchInvoices,
  navigate
) => {
  const statuses = [
    "paid",
    "invoiced_in_error",
    "waiver",
    "voucher",
    "refund",
    "uncollectible",
  ];
  return {
    key: `${menuKey}.${statuses.indexOf(status) + 1}`,
    label: (
      <Button
        block
        onClick={() =>
          changeStatus(status, invoice_id, auth_token, fetchInvoices, navigate)
        }
      >
        {statusLabels[status]}
      </Button>
    ),
  };
};

const createMarkStatusMenuItem = (
  menuKey,
  status,
  invoice_id,
  invoice,
  auth_token,
  fetchInvoices,
  modalFunction,
  navigate
) => {
  const statuses = [
    "paid",
    "invoiced_in_error",
    "waiver",
    "voucher",
    "refund",
    "uncollectible",
  ];
  if (status === "waiver" || status === "voucher") {
    return {
      key: `${menuKey}.${statuses.indexOf(status) + 1}`,
      label: (
        <Button
          block
          onClick={() => modalFunction(statusLabels[status], invoice)}
        >
          {statusLabels[status]}
        </Button>
      ),
    };
  }
  return {
    key: `${menuKey}.${statuses.indexOf(status) + 1}`,
    label: (
      <Button
        block
        onClick={() =>
          changeLabel(status, invoice_id, auth_token, fetchInvoices, navigate)
        }
      >
        {statusLabels[status]}
      </Button>
    ),
  };
};

const markStatusMenu = (
  menuKey,
  invoice_id,
  invoice,
  auth_token,
  fetchInvoices,
  modalFunction,
  navigate
) => {
  const status = invoice.status;
  const markedStatus = invoice.metadata.marked_status;
  const setStatus = invoice.metadata.custom_status;
  const availableMarkOptions = [];
  const menu = {
    key: menuKey,
    label: "Mark Invoice",
    children: [],
  };

  switch (status) {
    case "draft":
      menu.children.push(
        ...["invoiced_in_error", "waiver", "voucher"].map((availableStatus) =>
          createMarkStatusMenuItem(
            menuKey,
            availableStatus,
            invoice_id,
            invoice,
            auth_token,
            fetchInvoices,
            modalFunction,
            navigate
          )
        )
      );
      break;
    case "open":
      menu.children.push(
        ...[
          "paid",
          "invoiced_in_error",
          "waiver",
          "voucher",
          "uncollectible",
        ].map((availableStatus) =>
          createMarkStatusMenuItem(
            menuKey,
            availableStatus,
            invoice_id,
            invoice,
            auth_token,
            fetchInvoices,
            modalFunction,
            navigate
          )
        )
      );
      break;
    case "void":
      break;
    case "uncollectible":
      break;
    case "paid":
      menu.children.push(
        ...[
          "refund",
          "uncollectible",
          "invoiced_in_error",
        ].map((availableStatus) =>
          createMarkStatusMenuItem(
            menuKey,
            availableStatus,
            invoice_id,
            invoice,
            auth_token,
            fetchInvoices,
            modalFunction,
            navigate
          )
        )
      );
      break;
    default:
      break;
  }

  if (
    menu.children.length < 1 ||
    ["invoiced_in_error", "uncollectible", "refund"].includes(setStatus)
  ) {
    menu.disabled = true;
    menu.label = "Cannot mark this invoice";
  }
  return menu;
};

const changeStatusMenu = (
  menuKey,
  invoice_id,
  invoice,
  auth_token,
  fetchInvoices,
  navigate
) => {
  const markedStatus = invoice.metadata.marked_status;
  const setStatus = invoice.metadata.custom_status;
  const status = invoice.status;
  const menu = {
    key: menuKey,
    label: "Change Status",
    children: [],
  };

  switch (status) {
    case "draft":
      menu.children.push(
        ...["invoiced_in_error", "waiver", "voucher"].map((s) =>
          createChangeStatusMenuItem(
            menuKey,
            s,
            invoice_id,
            auth_token,
            fetchInvoices,
            navigate
          )
        )
      );
      break;
    case "paid":
      menu.children.push(
        ...["refund"].map((availableStatus) =>
          createChangeStatusMenuItem(
            menuKey,
            availableStatus,
            invoice_id,
            auth_token,
            fetchInvoices,
            navigate
          )
        )
      );
      break;
    case "uncollectible":
      break;
    case "void":
      break;
    case "open":
      menu.children.push(
        ...[
          "paid",
          "waiver",
          "voucher",
          "invoiced_in_error",
          "uncollectible",
        ].map((availableStatus) =>
          createChangeStatusMenuItem(
            menuKey,
            availableStatus,
            invoice_id,
            auth_token,
            fetchInvoices,
            navigate
          )
        )
      );
      break;
    default:
      break;
  }

  if (setStatus === "refund" && status === "paid") {
    menu.children = [
      "uncollectible",
      "invoiced_in_error",
    ].map((availableStatus) =>
      createChangeStatusMenuItem(
        menuKey,
        availableStatus,
        invoice_id,
        auth_token,
        fetchInvoices,
        navigate
      )
    );
  }

  if (
    menu.children.length < 1 ||
    ["uncollectible", "invoiced_in_error"].includes(setStatus)
  ) {
    menu.disabled = true;
    menu.label = "Cannot change status";
  }
  return menu;
};

const refundMenuItem = (
  key,
  invoice_id,
  invoice,
  auth_token,
  fetchInvoices,
  navigate
) => {
  if (invoice.status === "paid")
    return {
      key: key,
      label: (
        <Button
          type="primary"
          danger
          icon={<RollbackOutlined />}
          block
          onClick={() =>
            changeStatus(
              "refund",
              invoice_id,
              auth_token,
              fetchInvoices,
              navigate
            )
          }
        >
          Refund
        </Button>
      ),
    };
};

const actionsMenu = (
  invoice_id,
  invoice,
  auth_token,
  fetchInvoices,
  navigate,
  modalFunction
) => {
  return (
    <Menu
      items={[
        {
          key: 1,
          label: (
            <NavLink to={"/sheet/invoice/view/" + invoice_id}>
              <Button type="dashed" icon={<LayoutOutlined />} block>
                View Invoice
              </Button>
            </NavLink>
          ),
        },
        markStatusMenu(
          2,
          invoice_id,
          invoice,
          auth_token,
          fetchInvoices,
          modalFunction,
          navigate
        ),
        changeStatusMenu(
          3,
          invoice_id,
          invoice,
          auth_token,
          fetchInvoices,
          navigate
        ),
        refundMenuItem(
          4,
          invoice_id,
          invoice,
          auth_token,
          fetchInvoices,
          navigate
        ),
      ]}
      onClick={(e) => console.log(e)}
    />
  );
};

const onChange = (pagination, filters, sorter, extra) => {
  console.log("params", pagination, filters, sorter, extra);
};

const ListInvoicesSheet = () => {
  const authHeader = useAuthHeader();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState({
    start: moment()
      .subtract(1, "month")
      .endOf("day"),
    end: moment().endOf("day"),
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState({});
  const [coupans, setCoupans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCoupan, setSelectedCoupan] = useState({});
  const [selectedModalType, setModalType] = useState("");
  const [waiverAmount, setWaiverAmount] = useState(null);
  const [customerEmailFilter, setCustomerEmailFilter] = useState("");
  const [markedStatusFilter, setMarkedStatusFilter] = useState();
  const [setStatusFilter, setSetStatusFilter] = useState();
  const fetchCustomDateRangeData = () => {
    if (dates.length < 2) {
      return notification["warning"]({
        title: "View Invoice",
        description: "Please select start and end dates.",
      });
    }
    fetchInvoices();
  };

  const fetchInvoices = async () => {
    setLoading(true);
    apiCall(
      "/invoices/list",
      {
        created: { gte: dates.start.unix(), lte: dates.end.unix() },
        customer_email_filter: customerEmailFilter,
        marked_status_filter: markedStatusFilter,
        set_status_filter: setStatusFilter,
      },
      (r) => {
        let invoices = r.data.data.data;

        invoices.forEach((row, index) => {
          row.created_verbose = hdate.prettyPrint(getDateObject(row.created), {
            showTime: true,
          });
          row.key = index;
        });

        setLoading(false);
        setInvoices(invoices);
      },
      authHeader(),
      setLoading,
      navigate
    );
  };

  const fetchCoupans = () => {
    apiCall(
      "/invoices/coupon-codes-all",
      {},
      (r) => {
        const coupans = r.data.data.data;
        if (coupans.length < 1) {
          notification["warning"]({
            message: "You don't have any voucher codes created",
            description: "Go to stripe to create some promotion codes",
          });
        }
        setCoupans(coupans);
        setIsLoading(false);
      },
      authHeader()
    );
  };

  const onChangeCoupans = (value) => {
    if (selectedModalType === "Waiver") {
      setWaiverAmount(value);
    } else {
      setSelectedCoupan(JSON.parse(value));
    }
  };

  const showModal = (modalType, invoice) => {
    setModalType(modalType);
    setCurrentInvoice(invoice);
    setIsModalVisible(true);
    fetchCoupans();
  };

  const handleOk = () => {
    if (selectedModalType === "Waiver") {
      changeLabel(
        "waiver",
        currentInvoice.id,
        authHeader(),
        fetchInvoices,
        navigate,
        waiverAmount * 100 || currentInvoice.metadata.waiver_amount
      );
    } else {
      changeLabel(
        "voucher",
        currentInvoice.id,
        authHeader(),
        fetchInvoices,
        navigate,
        waiverAmount * 100 || currentInvoice.metadata.waiver_amount,
        selectedCoupan.id
      );
    }
    setCoupans([]);
    setWaiverAmount(null);
    setIsModalVisible(false);
    fetchInvoices();
  };

  const handleCancel = () => {
    setSelectedCoupan({});
    setCoupans([]);
    setWaiverAmount(null);
    setIsModalVisible(false);
  };

  const columns = [
    // Offering
    {
      title: "Offering",
      dataIndex: "account_name",
      key: "account_name",
    },
    // Email
    {
      title: "Email",
      dataIndex: "customer_email",
      key: "customer_email",
    },
    // Amount
    {
      title: "Amount",
      dataIndex: "amount_due",
      key: "amount_due",
      align: "center",
      render: (amount, invoice) => {
        return <span>{printAmount(invoice)}</span>;
      },
    },
    // Waiver Amount
    {
      title: "Waiver Amount",
      dataIndex: "metadata.waiver_amount",
      key: "waiver_amount",
      align: "center",
      render: (waiver_amount, invoice) => {
        if (invoice?.metadata?.waiver_amount) {
          return (
            <span>
              {getSymbolFromCurrency(invoice.currency)}
              {invoice.metadata.waiver_amount
                ? Math.floor(invoice.metadata.waiver_amount / 100)
                : 0}
            </span>
          );
        } else {
          return <span>{getSymbolFromCurrency(invoice.currency)}0</span>;
        }
      },
    },
    // Marked for Status
    {
      title: "Marked for",
      dataIndex: "metadata.marked_status",
      key: "marked_status",
      align: "center",
      render: (metadata_marked_status, invoice) => {
        if (invoice.metadata.marked_status) {
          return <StatusTag faint status={invoice.metadata.marked_status} />;
        }
      },
      filters: statusFilters,
      onFilter: (value, record) => record.status === value,
    },
    // Current Status
    {
      title: "Current status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status, invoice) => (
        <StatusTag
          status={status}
        />
      ),
      filters: statusFilters,
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Created",
      dataIndex: "created_verbose",
      key: "created_verbose",
    },
    {
      title: "Action",
      dataIndex: "id",
      key: "action",
      render: (invoice_id, invoice) => {
        return (
          <Dropdown
            arrow={false}
            overlay={actionsMenu(
              invoice_id,
              invoice,
              authHeader(),
              fetchInvoices,
              navigate,
              showModal
            )}
            placement="bottomRight"
          >
            <Button>
              <Space>
                Actions
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  const getAmount = (invoice) => {
    return `${getSymbolFromCurrency(invoice.currency)}${Math.floor(
      (invoice.amount_due - (selectedCoupan.amount_off || 0)) / 100
    ) - Math.floor(waiverAmount || 0)}`;
  };

  useEffect(() => {
    // const end = moment().endOf("day");
    // const start = moment()
    //   .subtract(1, "month")
    //   .endOf("day");
    // setDates([start, end]);
    fetchInvoices();
  }, [dates]);
  const options = coupans
    ? coupans.map((item) => (
        <Option key={item.id} value={JSON.stringify(item)}>
          {getSymbolFromCurrency(item.coupon.currency)}
          {Math.floor(item.coupon.amount_off / 100)} - {item.code}
        </Option>
      ))
    : [];
  const markedStatuses = [
    {
      status: "draft",
      text: "Draft",
    },
    {
      status: "invoiced_in_error",
      text: "Invoiced in error",
    },
    {
      status: "waiver",
      text: "Waiver",
    },
    {
      status: "voucher",
      text: "Voucher",
    },
    {
      status: "refund",
      text: "Refund",
    },
    {
      status: "uncollectible",
      text: "Uncollectable",
    },
    {
      status: "paid",
      text: "Paid",
    },
  ];
  const setStatuses = [...markedStatuses, { status: "open", text: "Open" }];
  const markedStatusFilterOptions = markedStatuses.map(({ status, text }) => (
    <Option key={status} value={status}>
      {text}
    </Option>
  ));
  const setStatusFilterOptions = setStatuses.map(({ status, text }) => (
    <Option key={status} value={status}>
      {text}
    </Option>
  ));
  return (
    <div className="sheet">
      <Space>
        <h2>Invoices </h2>
      </Space>
      <Space>
        <RangePicker
          onCalendarChange={(dates) => {
            if (dates.length)
              setDates({
                start: dates[0],
                end: dates[1],
              });
          }}
          defaultValue={[dates.start, dates.end]}
        />
        <Input
          placeholder="Email"
          value={customerEmailFilter}
          onChange={(e) => setCustomerEmailFilter(e.target.value)}
          allowClear="true"
        />

        <Select
          placeholder="Marked status"
          onChange={(status) => setMarkedStatusFilter(status)}
          value={markedStatusFilter}
          allowClear="true"
        >
          {" "}
          {markedStatusFilterOptions}{" "}
        </Select>

        <Select
          placeholder="Set status"
          onChange={setSetStatusFilter}
          value={setStatusFilter}
          allowClear="true"
        >
          {" "}
          {setStatusFilterOptions}{" "}
        </Select>

        <Button
          onClick={() => fetchCustomDateRangeData()}
          icon={<OrderedListOutlined />}
          shape="round"
          type="primary"
        >
          Get Invoices
        </Button>
      </Space>
      <Table
        loading={loading}
        dataSource={invoices}
        columns={columns}
        onChange={onChange}
      />
      <Modal
        destroyOnClose={true}
        title={selectedModalType + " Details"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{
          disabled: !selectedCoupan.hasOwnProperty("id") && !waiverAmount,
        }}
      >
        <p>Offerting : {currentInvoice.account_name}</p>
        <p>Email : {currentInvoice.customer_email}</p>
        <p>Amount : {getAmount(currentInvoice)}</p>
        <p>Created At : {currentInvoice.created_verbose}</p>
        {selectedModalType.toLowerCase() === "waiver" ? (
          <Space>
            <p>Waiver Amount :</p>
            <Input
              placeholder="Enter waiver amount"
              value={waiverAmount}
              onChange={(e) => onChangeCoupans(e.target.value)}
              prefix={getSymbolFromCurrency(currentInvoice.currency)}
            />
          </Space>
        ) : (
          <Space>
            <p>Coupons list :</p>
            <Select
              placeholder="Select coupon"
              onChange={onChangeCoupans}
              loading={isLoading}
            >
              {options}
            </Select>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default ListInvoicesSheet;
