import React, { useState, useEffect } from 'react'
import { Button, Dropdown, Menu, Space, Table, Tag } from "antd"
import { DownOutlined, LayoutOutlined, RollbackOutlined, SmileOutlined } from '@ant-design/icons';
import { apiCall, getDateObject } from '../../helpers';
import { NavLink } from 'react-router-dom';
import StatusTag from './snippets/StatusTag';

const hdate = require("human-date");

const actionsMenu = (invoice_id) => {
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
                    label : (
                        <NavLink to="/">
                            <Button type='primary' danger icon={<RollbackOutlined/>} block >Refund</Button>
                        </NavLink>
                    )
                }
            ]}

            onClick={(e) => console.log(e)}
        />
    )
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
        render : (amount) => {
            return ( 
                <b>{`₹${amount}`}</b>
            )
        }
    },
    // Status
    {
        title : "Status",
        dataIndex : "status",
        key : "status",
        align : "center",
        render : (status) => <StatusTag status={status}/>,
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
                arrow={1}
                overlay={actionsMenu(invoice_id)}
                placement="bottomRight"
            >
                <Button >
                    <Space>
                    Take Action
                    <DownOutlined/>
                    </Space>
                </Button>
            </Dropdown>
            )
        }
    }
]

const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  };

const ListInvoicesSheet =  () => {

    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        
        apiCall("/invoices/list", {}, (r) => {

            let invoices = r.data.data.data;
            // console.log(Array.isArray(invoices))
            invoices.forEach((row, index) => {
                row.created_verbose = hdate.prettyPrint(getDateObject(row.created), { showTime : true });
                row.key = index;
            })
            console.log(invoices);

            setInvoices(invoices);
        })
      
    }, [])
    
    return (
        <div className='sheet'>
            <Space/>
            <h1>Invoices </h1>
            
            <Table dataSource={invoices} columns={columns} onChange={onChange} />
            
        </div>
    )
}

export default ListInvoicesSheet