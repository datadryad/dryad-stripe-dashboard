import React, { useState, useEffect } from 'react'
import { Button, Dropdown, Menu, Space, Table, Tag } from "antd"
import { BookOutlined, MinusCircleOutlined} from '@ant-design/icons';
import { apiCall, getDateObject, getStatusColor, printAmount, ReportError, reportVerbose } from '../../helpers';
import { NavLink, useNavigate } from 'react-router-dom';
import StatusTag from './snippets/StatusTag';
import { useAuthHeader } from 'react-auth-kit';
import commaNumber from 'comma-number';

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




const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  };


const ListReportsSheet =  () => {

    const authHeader = useAuthHeader();
    const navigate = useNavigate();
    
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchReports = () => {
        setLoading(true);
        apiCall("/reports/list", {}, (r) => {
    
            const reports = r.data.data.data;
            reports.forEach(r => {
                r.key = r.id
            });

            setReports(reports);
            setLoading(false);
        }, authHeader(), setLoading, navigate)
        
    }

    const columns = [
        // Report Category
        {
            title : "Report Category",
            dataIndex : "report_type",
            key : "report_type",
            render : (report_type) => {
                return reportVerbose(report_type);
            }
        },
        // Size
        {
            title : "Size",
            dataIndex : "size",
            key : "size",
            render : (size, report) => commaNumber(report.result.size) + " KB"
        },
        // Created
        {
            title : "Created",
            dataIndex : "created",
            key : "created",
            render : (created) => hdate.prettyPrint(getDateObject(created))
        },
        {
            title : "Interval",
            dataIndex : "parameters",
            key : "parameters",
            render : (parameters) => {
              return `${hdate.prettyPrint(getDateObject(parameters.interval_start))} to ${hdate.prettyPrint(getDateObject(parameters.interval_end))}.`;
            }
        },
        
        {
            title : "Action",
            dataIndex : "id",
            key : "action",
            colSpan : 2,
            render : (report_id, report) => {

                if(report.status == 'succeeded') return (
                    <NavLink to={"/sheet/report/view/" + report_id}>
                        <Button type='primary' icon={<BookOutlined />} block >View Report</Button>
                    </NavLink>
                )
                else return (
                    <Button disabled type="primary" icon={<MinusCircleOutlined/>} block >Report {report.status}</Button>
                )
            }
        }
    ]

    

    useEffect(() => {
        
        fetchReports();
      
    }, [])
    
    return (
        <div className='sheet'>
            <Space/>
            <h1>Reports </h1>
            
            <Table loading={loading} dataSource={reports} columns={columns} onChange={onChange} />
            
        </div>
    )
}



export default ListReportsSheet