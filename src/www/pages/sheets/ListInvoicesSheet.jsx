import React, { useState, useEffect } from 'react'
import { Button, Dropdown, Menu, Space, Table, Tag } from "antd"
import { DownOutlined, LayoutOutlined, RightCircleOutlined, RollbackOutlined, SmileOutlined } from '@ant-design/icons';
import { apiCall, getDateObject, getStatusColor, printAmount, ReportError } from '../../helpers';
import { NavLink, useNavigate } from 'react-router-dom';
import StatusTag from './snippets/StatusTag';
import { useAuthHeader } from 'react-auth-kit';

const hdate = require("human-date");

const changeStatus = (new_status, invoice_id, auth_token, fetchInvoices, navigate) => {

    apiCall(`/invoices/update/${new_status}`, {invoice_id}, (response) => {
        if(response.status == 200) fetchInvoices();
        else{
            ReportError(response);
        }
    }, auth_token, null, navigate);
}

const changeLabel = (new_status, invoice_id, auth_token, fetchInvoices, navigate) => {

    apiCall(`/invoices/update/label/${new_status}`, {invoice_id}, (response) => {
        if(response.status == 200) fetchInvoices();
        else{
            ReportError(response);
        }
    }, auth_token, null, navigate);
}

const actionsMenu = (invoice_id, auth_token, fetchInvoices, navigate) => {
    
    
    return (

        <Menu 
            items={[
                {
                    key : 1,
                    label : (
                        <NavLink to={"/sheet/invoice/view/" + invoice_id}>
                            <Button type='dashed' icon={<LayoutOutlined/>} block >View Invoice</Button>
                        </NavLink>
                    ),

                },
                {
                    key : 2,
                    label : 'Mark Invoice',
                    children : [
                        {
                            key : '2.1',
                            label : (
                                <Button block type="dashed" onClick={() => changeLabel("paid", invoice_id, auth_token, fetchInvoices, navigate)}>Paid</Button>
                            )
                        },
                        {
                            key : '2.2',
                            label : (
                                <Button block type="dashed" onClick={() => changeLabel("invoiced_in_error", invoice_id, auth_token, fetchInvoices, navigate)}>Invoiced in error</Button>
                            )
                        },
                        {
                            key : '2.3',
                            label : (
                                <Button block type="dashed" onClick={() => changeLabel("waiver", invoice_id, auth_token, fetchInvoices, navigate)}>Waiver</Button>
                            )
                        },
                        {
                            key : '2.4',
                            label : (
                                <Button block type="dashed" onClick={() => changeLabel("voucher", invoice_id, auth_token, fetchInvoices, navigate)}>Voucher</Button>
                            )
                        },
                        {
                            key : '2.5',
                            label : (
                                <Button block type="dashed" onClick={() => changeLabel("refund", invoice_id, auth_token, fetchInvoices, navigate)}>Refund</Button>
                            )
                        },
                        {
                            key : '2.6',
                            label : (
                                <Button block type="dashed" onClick={() => changeLabel("uncollectible", invoice_id, auth_token, fetchInvoices, navigate)}>Uncollectible</Button>
                            )
                        },
                    ]
                },
                {
                    key : 3,
                    label : 'Change Status',
                    children : [
                        {
                            key : '3.1',
                            label : (
                                <Button block onClick={() => changeStatus("paid", invoice_id, auth_token, fetchInvoices, navigate)}>Paid</Button>
                            )
                        },
                        {
                            key : '3.2',
                            label : (
                                <Button block onClick={() => changeStatus("invoiced_in_error", invoice_id, auth_token, fetchInvoices, navigate)}>Invoiced in error</Button>
                            )
                        },
                        {
                            key : '3.3',
                            label : (
                                <Button block onClick={() => changeStatus("waiver", invoice_id, auth_token, fetchInvoices, navigate)}>Waiver</Button>
                            )
                        },
                        {
                            key : '3.4',
                            label : (
                                <Button block onClick={() => changeStatus("voucher", invoice_id, auth_token, fetchInvoices, navigate)}>Voucher</Button>
                            )
                        },
                        {
                            key : '3.5',
                            label : (
                                <Button block onClick={() => changeStatus("refund", invoice_id, auth_token, fetchInvoices, navigate)}>Refund</Button>
                            )
                        },
                        {
                            key : '3.6',
                            label : (
                                <Button block onClick={() => changeStatus("uncollectible", invoice_id, auth_token, fetchInvoices, navigate)}>Uncollectible</Button>
                            )
                        },
                    ]
                },
                {
                    key : 4,
                    label : (
                            <Button type='primary' danger icon={<RollbackOutlined/>} block onClick={() => changeStatus("uncollectible", invoice_id, auth_token, fetchInvoices, navigate)} >Refund</Button>
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


const ListInvoicesSheet =  () => {

    const authHeader = useAuthHeader();
    const navigate = useNavigate();
    
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchInvoices = () => {
        setLoading(true);
        apiCall("/invoices/list", {}, (r) => {
    
            let invoices = r.data.data.data;
            
            invoices.forEach((row, index) => {
                row.created_verbose = hdate.prettyPrint(getDateObject(row.created), { showTime : true });
                row.key = index;
            })

            console.log(invoices)
            setLoading(false);
            setInvoices(invoices);
        }, authHeader(), setLoading, navigate)
        
    }

    const columns = [
        // Offering
        {
            title : "Offering",
            dataIndex : "account_name",
            key : "account_name"
        },
        // Email
        {
            title : "Email",
            dataIndex : "customer_email",
            key : "customer_email"
        },
        // Amount
        {
            title : "Amount",
            dataIndex : "amount_due",
            key : "amount_due",
            align : "center",
            render : (amount, invoice) => {
                return ( 
                    <span>{printAmount(invoice)}</span>
                )
            }
        },
        // Marked for Status
        {
            title : "Marked for",
            dataIndex : "metadata.marked_status",
            key : "marked_status",
            align : "center",
            render : (metadata_marked_status, invoice) => {
                
                if(invoice.metadata.marked_status){
                    return <StatusTag faint status={invoice.metadata.marked_status}/>
                }
            },
            filters : [
                {
                    text : 'Draft',
                    value : 'draft'
                },
                {
                    text : 'Invoiced in error',
                    value : 'invoiced_in_error'
                },
                {
                    text : 'Waiver',
                    value : 'waiver'
                },
                {
                    text : 'Voucher',
                    value : 'voucher'
                },
                {
                    text : 'Refund',
                    value : 'refund'
                },
                {
                    text : 'Uncollectible',
                    value : 'uncollectible'
                },
                {
                    text : "Open",
                    value : "open"
                },
                {
                    text : "Paid",
                    value : "paid"
                }
            ],
            onFilter: (value, record) => record.status === value,
        },
        // Current Status
        {
            title : "Current status",
            dataIndex : "status",
            key : "status",
            align : "center",
            render : (status, invoice) => <StatusTag status={invoice.metadata.hasOwnProperty("custom_status") ? invoice.metadata.custom_status : status}/>,
            filters : [
                {
                    text : 'Draft',
                    value : 'draft'
                },
                {
                    text : 'Invoiced in error',
                    value : 'invoiced_in_error'
                },
                {
                    text : 'Invoiced in error',
                    value : 'void'
                },
                {
                    text : 'Waiver',
                    value : 'waiver'
                },
                {
                    text : 'Voucher',
                    value : 'voucher'
                },
                {
                    text : 'Refund',
                    value : 'refund'
                },
                {
                    text : 'Uncollectible',
                    value : 'uncollectible'
                },
                {
                    text : "Open",
                    value : "open"
                },
                {
                    text : "Paid",
                    value : "paid"
                }
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title : "Created",
            dataIndex : "created_verbose",
            key : "created_verbose"
        },
        {
            title : "Action",
            dataIndex : "id",
            key : "action",
            render : (invoice_id) => {
                return (
                    <Dropdown
                    arrow={false}
                    overlay={actionsMenu(invoice_id, authHeader(), fetchInvoices, navigate)}
                    placement="bottomRight"
                >
                    <Button >
                        <Space>
                        Actions
                        <DownOutlined/>
                        </Space>
                    </Button>
                </Dropdown>
                )
            }
        }
    ]

    

    useEffect(() => {
        
        fetchInvoices();
      
    }, [])
    
    return (
        <div className='sheet'>
            <Space/>
            <h2>Invoices </h2>
            
            <Table loading={loading} dataSource={invoices} columns={columns} onChange={onChange} />
            
        </div>
    )
}

export default ListInvoicesSheet