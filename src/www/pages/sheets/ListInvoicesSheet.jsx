import React, { useState, useEffect } from 'react'
import { Button, Dropdown, Menu, Space, Table, DatePicker, notification, Modal, Select, Input } from "antd"
import { DownOutlined, LayoutOutlined, OrderedListOutlined, RollbackOutlined, SmileOutlined } from '@ant-design/icons';
import { apiCall, getDateObject, getStatusColor, printAmount, ReportError } from '../../helpers';
import { NavLink, useNavigate } from 'react-router-dom';
import StatusTag from './snippets/StatusTag';
import { useAuthHeader } from 'react-auth-kit';
import getSymbolFromCurrency from 'currency-symbol-map';
import moment from 'moment';
const { RangePicker } = DatePicker
const { Option } = Select;
const hdate = require("human-date");

const changeStatus = (new_status, invoice_id, auth_token, fetchInvoices, navigate) => {

    apiCall(`/invoices/update/${new_status}`, { invoice_id }, (response) => {
        if (response.status == 200) fetchInvoices();
        else {
            ReportError(response);
        }
    }, auth_token, null, navigate);
}

const changeLabel = (new_status, invoice_id, auth_token, fetchInvoices, navigate, waiver_amount, voucher_amount) => {
    if (!waiver_amount) waiver_amount = 0;
    if (!voucher_amount) voucher_amount = 0;
    apiCall(`/invoices/update/label/${new_status}`, { invoice_id, waiver_amount, voucher_amount }, (response) => {
        if (response.status == 200) fetchInvoices();
        else {
            ReportError(response);
        }
    }, auth_token, null, navigate);
}

const actionsMenu = (invoice_id, invoice, auth_token, fetchInvoices, navigate, modalFunction) => {
    return (
        <Menu
            items={[
                {
                    key: 1,
                    label: (
                        <NavLink to={"/sheet/invoice/view/" + invoice_id}>
                            <Button type='dashed' icon={<LayoutOutlined />} block >View Invoice</Button>
                        </NavLink>
                    ),

                },
                {
                    key: 2,
                    label: 'Mark Invoice',
                    children: [
                        {
                            key: '2.1',
                            label: (
                                <Button block type="dashed" onClick={() => changeLabel("paid", invoice_id, auth_token, fetchInvoices, navigate)}>Paid</Button>
                            )
                        },
                        {
                            key: '2.2',
                            label: (
                                <Button block type="dashed" onClick={() => changeLabel("invoiced_in_error", invoice_id, auth_token, fetchInvoices, navigate)}>Invoiced in error</Button>
                            )
                        },
                        {
                            key: '2.3',
                            label: (
                                <Button block type="dashed" onClick={() => modalFunction('Waiver', invoice)}>Waiver</Button>
                            )
                        },
                        {
                            key: '2.4',
                            label: (
                                <Button block type="dashed" onClick={() => modalFunction('Voucher', invoice)}>Voucher</Button>
                            )
                        },
                        {
                            key: '2.5',
                            label: (
                                <Button block type="dashed" onClick={() => changeLabel("refund", invoice_id, auth_token, fetchInvoices, navigate)}>Refund</Button>
                            )
                        },
                        {
                            key: '2.6',
                            label: (
                                <Button block type="dashed" onClick={() => changeLabel("uncollectible", invoice_id, auth_token, fetchInvoices, navigate)}>Uncollectible</Button>
                            )
                        },
                    ]
                },
                {
                    key: 3,
                    label: 'Change Status',
                    children: [
                        {
                            key: '3.1',
                            label: (
                                <Button block onClick={() => changeStatus("paid", invoice_id, auth_token, fetchInvoices, navigate)}>Paid</Button>
                            )
                        },
                        {
                            key: '3.2',
                            label: (
                                <Button block onClick={() => changeStatus("invoiced_in_error", invoice_id, auth_token, fetchInvoices, navigate)}>Invoiced in error</Button>
                            )
                        },
                        {
                            key: '3.3',
                            label: (
                                <Button block onClick={() => changeStatus("waiver", invoice_id, auth_token, fetchInvoices, navigate)}>Waiver</Button>
                            )
                        },
                        {
                            key: '3.4',
                            label: (
                                <Button block onClick={() => changeStatus("voucher", invoice_id, auth_token, fetchInvoices, navigate)}>Voucher</Button>
                            )
                        },
                        {
                            key: '3.5',
                            label: (
                                <Button block onClick={() => changeStatus("refund", invoice_id, auth_token, fetchInvoices, navigate)}>Refund</Button>
                            )
                        },
                        {
                            key: '3.6',
                            label: (
                                <Button block onClick={() => changeStatus("uncollectible", invoice_id, auth_token, fetchInvoices, navigate)}>Uncollectible</Button>
                            )
                        },
                    ]
                },
                {
                    key: 4,
                    label: (
                        <Button type='primary' danger icon={<RollbackOutlined />} block onClick={() => changeStatus("uncollectible", invoice_id, auth_token, fetchInvoices, navigate)} >Refund</Button>
                    )
                },
            ]}

            onClick={(e) => console.log(e)}
        />
    )
}




const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
};


const ListInvoicesSheet = () => {

    const authHeader = useAuthHeader();
    const navigate = useNavigate();

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState({});
    const [coupans, setCoupans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCoupan, setSelectedCoupan] = useState({});
    const [selectedModalType, setModalType] = useState('');
    const [voucherAmount, setVoucherAmount] = useState(null);
    let start, end
    const fetchCustomDateRangeData = () => {
        if (dates.length < 2) {
            return notification['warning']({
                title: "View Invoice",
                description: "Please select start and end dates."
            });
        }
        start = dates[0].unix();
        end = dates[1].unix();
        fetchInvoices();
    }


    const fetchInvoices = () => {
        setLoading(true);
        apiCall("/invoices/list", { created: { gte: start, lte: end } }, (r) => {

            let invoices = r.data.data.data;

            invoices.forEach((row, index) => {
                row.created_verbose = hdate.prettyPrint(getDateObject(row.created), { showTime: true });
                row.key = index;
            })

            console.log(invoices)
            setLoading(false);
            setInvoices(invoices);
        }, authHeader(), setLoading, navigate)

    }

    const fetchCoupans = () => {
        apiCall('/invoices/all-coupans-list', {}, (r) => {
            let coupans = r.data.data.data;
            setCoupans(coupans)
            setIsLoading(false)
        }, authHeader())
    }

    const onChangeCoupans = (value) => {
        if (selectedModalType === 'Waiver') {
            setSelectedCoupan(JSON.parse(value))
        } else {
            setVoucherAmount(value)
        }
    }
    const showModal = (modalType, invoice) => {
        setModalType(modalType)
        setCurrentInvoice(invoice);
        setIsModalVisible(true);
        fetchCoupans()
    };

    const handleOk = () => {
        if (selectedModalType === 'Waiver') {
            changeLabel("waiver", currentInvoice.id, authHeader(), fetchInvoices, navigate,
                selectedCoupan.amount_off || currentInvoice.metadata.waiver_amount)
        } else {
            changeLabel("voucher", currentInvoice.id, authHeader(), fetchInvoices, navigate,
                selectedCoupan.amount_off || currentInvoice.metadata.waiver_amount,
                voucherAmount * 100 || currentInvoice.metadata.voucher_amount)
        }
        setCoupans([])
        setVoucherAmount(null)
        setIsModalVisible(false);
        fetchInvoices()
    };

    const handleCancel = () => {
        setSelectedCoupan({})
        setCoupans([])
        setVoucherAmount(null)
        setIsModalVisible(false);
    };

    const columns = [
        // Offering
        {
            title: "Offering",
            dataIndex: "account_name",
            key: "account_name"
        },
        // Email
        {
            title: "Email",
            dataIndex: "customer_email",
            key: "customer_email"
        },
        // Amount
        {
            title: "Amount",
            dataIndex: "amount_due",
            key: "amount_due",
            align: "center",
            render: (amount, invoice) => {
                return (
                    <span>{printAmount(invoice)}</span>
                )
            }
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
                        <span>{getSymbolFromCurrency(invoice.currency)}{invoice.metadata.waiver_amount ? Math.floor(invoice.metadata.waiver_amount / 100) : 0}</span>
                    )
                } else {
                    return (
                        <span>{getSymbolFromCurrency(invoice.currency)}0</span>
                    )
                }
            }
        },
        // Marked for Status
        {
            title: "Marked for",
            dataIndex: "metadata.marked_status",
            key: "marked_status",
            align: "center",
            render: (metadata_marked_status, invoice) => {

                if (invoice.metadata.marked_status) {
                    return <StatusTag faint status={invoice.metadata.marked_status} />
                }
            },
            filters: [
                {
                    text: 'Draft',
                    value: 'draft'
                },
                {
                    text: 'Invoiced in error',
                    value: 'invoiced_in_error'
                },
                {
                    text: 'Waiver',
                    value: 'waiver'
                },
                {
                    text: 'Voucher',
                    value: 'voucher'
                },
                {
                    text: 'Refund',
                    value: 'refund'
                },
                {
                    text: 'Uncollectible',
                    value: 'uncollectible'
                },
                {
                    text: "Open",
                    value: "open"
                },
                {
                    text: "Paid",
                    value: "paid"
                }
            ],
            onFilter: (value, record) => record.status === value,
        },
        // Current Status
        {
            title: "Current status",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (status, invoice) => <StatusTag status={invoice.metadata.hasOwnProperty("custom_status") ? invoice.metadata.custom_status : status} />,
            filters: [
                {
                    text: 'Draft',
                    value: 'draft'
                },
                {
                    text: 'Invoiced in error',
                    value: 'invoiced_in_error'
                },
                {
                    text: 'Invoiced in error',
                    value: 'void'
                },
                {
                    text: 'Waiver',
                    value: 'waiver'
                },
                {
                    text: 'Voucher',
                    value: 'voucher'
                },
                {
                    text: 'Refund',
                    value: 'refund'
                },
                {
                    text: 'Uncollectible',
                    value: 'uncollectible'
                },
                {
                    text: "Open",
                    value: "open"
                },
                {
                    text: "Paid",
                    value: "paid"
                }
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: "Created",
            dataIndex: "created_verbose",
            key: "created_verbose"
        },
        {
            title: "Action",
            dataIndex: "id",
            key: "action",
            render: (invoice_id, invoice) => {
                return (
                    <Dropdown
                        arrow={false}
                        overlay={actionsMenu(invoice_id, invoice, authHeader(), fetchInvoices, navigate, showModal)}
                        placement="bottomRight"
                    >
                        <Button >
                            <Space>
                                Actions
                                <DownOutlined />
                            </Space>
                        </Button>
                    </Dropdown>
                )
            }
        }
    ]

    const getAmount = (invoice) => {
        return `${getSymbolFromCurrency(invoice.currency)}${Math.floor((invoice.amount_due - (selectedCoupan.amount_off || 0)) / 100) - Math.floor(voucherAmount || 0)}`;
    }

    useEffect(() => {
        end = moment().startOf("day").unix();
        start = moment().subtract(1, "month").endOf("day").unix();
        setDates([start, end]);
        fetchInvoices();

    }, [])
    const options = coupans ? coupans.map(item => <Option key={item.id} value={JSON.stringify(item)}>${Math.floor(item.amount_off / 100)}</Option>) : []
    return (
        <div className='sheet'>
            <Space />
            <Space>
                <h2>Invoices </h2>
                <RangePicker onCalendarChange={(dates) => { if (dates.length) setDates(dates) }}
                    defaultValue={[moment().startOf("day"), moment().subtract(30, "days").endOf("day")]} />
                <Button onClick={() => fetchCustomDateRangeData()} icon={<OrderedListOutlined />} shape="round" type="primary">Get Invoices</Button>
            </Space>
            <Table loading={loading} dataSource={invoices} columns={columns} onChange={onChange} />
            <Modal destroyOnClose={true} title={selectedModalType + " Details"}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okButtonProps={{ disabled: !selectedCoupan.hasOwnProperty('amount_off') && !voucherAmount }}>
                <p>Offerting : {currentInvoice.account_name}</p>
                <p>Email : {currentInvoice.customer_email}</p>
                <p>Amount : {getAmount(currentInvoice)}</p>
                <p>Created At : {currentInvoice.created_verbose}</p>
                {selectedModalType.toLowerCase() === 'waiver' ?
                    <Space>
                        <p>Coupans list :</p>
                        <Select
                            placeholder='Select Waiver Amount'
                            onChange={onChangeCoupans}
                            loading={isLoading}
                        >
                            {options}
                        </Select>
                    </Space> :
                    <Space>
                        <p>Voucher amount :</p>
                        <Input placeholder="Enter voucher amount"
                            value={voucherAmount}
                            onChange={(e) => onChangeCoupans(e.target.value)}
                            prefix={getSymbolFromCurrency(currentInvoice.currency)} />
                    </Space>
                }

            </Modal>
        </div>
    )
}

export default ListInvoicesSheet