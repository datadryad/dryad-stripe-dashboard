import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { apiCall, getDateObject } from '../../helpers';
import gradient from 'random-gradient';
import "./styles/ViewInvoiceSheet.css"
import { Col, Divider, Tag, Row, Button, Table } from 'antd';
import StatusTag from './snippets/StatusTag';
import { RollbackOutlined } from '@ant-design/icons';
import { useAuthHeader } from 'react-auth-kit';

const getSymbolFromCurrency = require('currency-symbol-map')
const hdate = require("human-date");

function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }

const cols = [
    {
        title : "No.",
        dataIndex : "dummy",
        key : "dummy",
        render : (t, o, index) => {
            return index + 1;
        }
    },
    {
        title : "Description",
        dataIndex : "description",
        key : "description"
    },
    {
        title : "Type",
        dataIndex : "price",
        render : (price) => {
            let s = toTitleCase(price.type);
            s = s.replaceAll('_', ' ');
            return s;
        },
        key : "type"
    },
    {
        title : "Quantity",
        dataIndex : "quantity",
        key : "quantity"
    },
    {
        title : "Amount",
        dataIndex : "amount",
        key : "amount",
        render : (amount, invoice) => {
            
          return getSymbolFromCurrency(invoice.currency) + Math.round(amount/100);
        }
    }
]

const ViewInvoiceSheet = () => {

    const authHeader = useAuthHeader();
    const navigate = useNavigate();

    let { invoice_id } = useParams();
    const [invoice, setInvoice] = useState({});
    const [items, setItems] = useState([]);
    
    useEffect(() => {
      
        apiCall("/invoices/retrieve", {invoice_id}, (response) => {
            const invoice = response.data.data;
            // console.log(invoice_id, bg)


            setInvoice(invoice);
            setItems(invoice.lines.data);
        }, authHeader(), null, navigate);
    }, [])
    

    return (
        <div className='sheet'>
            <div className='sheet envelope no-margin' >
                {invoice.id && 
                    <>
                        <div>
                            <h1>{(invoice.customer_name) ? `${invoice.customer_name.split(" ")[0]}'s Invoice` : "Invoice"} </h1>
                            <h3>{invoice.number} for {getSymbolFromCurrency(invoice.currency) + invoice.amount_due}  </h3>
                            <h3>Due in {hdate.relativeTime(getDateObject(invoice.due_date))}.  </h3>
                        </div>
                        <div className='envelope-sub'>
                            <div className="row">
                                <div>Invoice ID :</div>
                                <div><Tag >{invoice.id}</Tag></div>
                            </div>
                            <div className="row">
                                <div>Charge Date : </div>
                                <div><Tag >{hdate.prettyPrint(getDateObject(invoice.created), { showTime : true })}</Tag></div>
                            </div>
                            <div className="row" style={{marginTop : '1.2em', display : 'flex', justifyContent : 'flex-end', marginRight : '0.2em'}}>
                                <Button size='huge' type='primary' danger icon={<RollbackOutlined/>} >Refund</Button>
                            </div>
                        </div>
                    </>
                }
            </div>
            {invoice.id && 
            
            <div className="sheet no-margin invoice-container">
                <Row gutter={16}>
                    <Col span={8}>
                        <h2>From</h2>
                        <div className="bulky-divider" ></div>
                        <h3>{invoice.account_name}</h3>

                    </Col>
                    <Col span={8}>
                        <h2>To</h2>
                        <div className="bulky-divider" ></div>
                        {invoice.customer_name && <h4>Name : {invoice.customer_name}</h4>}
                        {invoice.customer_email && <h4>Email : {invoice.customer_email}</h4>}
                        {invoice.customer_address && <h4>Address : {invoice.customer_address}</h4>}
                        {invoice.customer_phone && <h4>Phone : {invoice.customer_phone}</h4>}
                    </Col>
                    <Col span={8}>
                        <h2>Details</h2>
                        <div className="bulky-divider" ></div>
                        <h4>Invoice total : {getSymbolFromCurrency(invoice.currency)}{Math.round(invoice.amount_due/100)}</h4>
                        <h4>Status : <StatusTag status={invoice.status}/></h4>

                    </Col>
                </Row>

                <Divider/>
                <Table columns={cols} dataSource={items} />
            </div>

            }
            <Divider/>
        </div>
    )
}



export default ViewInvoiceSheet;