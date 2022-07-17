import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { apiCall, getDateObject, reportVerbose } from '../../helpers';
import "./styles/ViewInvoiceSheet.css"
import { Col, Divider, Tag, Row, Button, Table, Skeleton } from 'antd';
import { useAuthHeader } from 'react-auth-kit';
import { CloudDownloadOutlined, RollbackOutlined } from '@ant-design/icons';

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

const ViewReportSheet = () => {

    const authHeader = useAuthHeader();
    const navigate = useNavigate();

    let { report_id } = useParams();
    const [report, setReport] = useState({});
    const [downloadLink, setDownloadLink] = useState(false);
    const [data, setData] = useState([]);
    const [cols, setCols] = useState([]);
    
    useEffect(() => {
        apiCall("/reports/retrieve", {report_id}, (response) => {
            const report = response.data.data;

            console.log(report);
            setReport(report);


            apiCall("/reports/file", {file_id : report.result.id}, (response) => {
                const data = response.data.data;
                const content = data.content;
                const link = data.link;
                setDownloadLink(link);
                // Create and set columns
                let columns = [];

                for (const key in content[0]) {
                    if (Object.hasOwnProperty.call(content[0], key)) {

                        if(key == "category") continue;
                        const curr = {
                            dataIndex : key,
                            key : key
                        };
                        let title = key.replaceAll('_', ' ');
                        curr.title = toTitleCase(title);
                        columns.push(curr);
                        
                    }
                }

                setCols(columns);
                setData(content);

                

            }, authHeader(), null, navigate);
        }, authHeader(), null, navigate);
    }, [])
    

    return (
        <div className='sheet'>
            <div className='sheet envelope no-margin' >
                {report.id ?
                    <>
                        <div>
                            <h1>{report ? reportVerbose(report.report_type) : "Report"} </h1>
                            {report && <h3>From <u>{hdate.prettyPrint(getDateObject(report.parameters.interval_start))}</u> to <u>{hdate.prettyPrint(getDateObject(report.parameters.interval_end))}.</u></h3>}
                        </div>
                        <div className='envelope-sub'>
                            <div className="row">
                                <div>Report ID :</div>
                                <div><Tag >{report.id}</Tag></div>
                            </div>
                            <div className="row">
                                <div>Created On : </div>
                                <div><Tag >{hdate.prettyPrint(getDateObject(report.created), { showTime : true })}</Tag></div>
                            </div>
                            <div className="row" style={{marginTop : '1.2em', display : 'flex', justifyContent : 'flex-end', marginRight : '0.2em'}}>
                                <Button target="blank" href={downloadLink} disabled={!downloadLink} size='huge' type='primary' icon={<CloudDownloadOutlined/>} shape="round" >Download CSV</Button>
                            </div>
                        </div>
                    </>
                
                    :
                    <Skeleton active />
                }
            </div>
            {data && 
                    <div className='sheet no-margin invoice-container'>
                        <Table loading={data.length == 0} columns={cols} dataSource={data} pagination={false} />
                    </div>
            }

        </div>
    )
}



export default ViewReportSheet;