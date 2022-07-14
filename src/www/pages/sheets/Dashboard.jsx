import { DollarOutlined, PlusCircleFilled } from '@ant-design/icons';
import { Carousel, Col, Row, Segmented, Statistic } from 'antd';
import { Area, Line } from "@ant-design/charts";
import { apiCall } from '../../helpers';
import "./Dashboard.css"
import React, { useEffect, useRef, useState } from 'react'
import { useAuthHeader } from 'react-auth-kit';
import moment from 'moment';

const commaNumber = require('comma-number')

const dummyStateData = 36000;
const dummyStateDataSmall = 36;

const Dashboard = () => {

    const carousel_ref = useRef();

    const [yesterday, setYesterday] = useState([]);
    const [yesterday_statistic, setYesterday_statistic] = useState(false);
    const [yesterday_type_amount, setYesterday_type_amount] = useState(true);

    const [lastWeek, setLastWeek] = useState([]);
    const [lastWeek_statistic, setLastWeek_statistic] = useState(false);
    const [lastWeek_type_amount, setLastWeek_type_amount] = useState(true);

    const authHeader = useAuthHeader();

    const fetchYesteday = () => {

        let yesterday = moment().subtract(1, "day");
        let start = yesterday.startOf("day").unix();
        let end = yesterday.endOf("day").unix();
    
        apiCall("/reports/dashboard/day", {start, end}, (response) => {
            const data = response.data.data;


            let amount = 0, count = 0;
            data.forEach(el => {
                
                const date = new Date();
                date.setHours(el._id.hour);

                el.hour = moment(date).format("hh a");
                count += el.count;
                amount += el.total_amount
                delete el._id
            });
            setYesterday_statistic({
                amount, count
            });

            console.log("YESTERDAY AGGREGATE DATA", data);
            setYesterday(data);

        }, authHeader());
    }

    const fetchLastWeek = () => {

        let last_week = moment().subtract(1, "week");
        let start = last_week.startOf("day").unix();
        let end = last_week.endOf("day").unix();
    
        apiCall("/reports/dashboard/week", {start, end}, (response) => {
            const data = response.data.data;


            let amount = 0, count = 0;
            data.forEach(el => {
                
                el.date = el._id.year + '-' + el._id.month + '-' + el._id.day; 
                
                count += el.count;
                amount += el.total_amount
                delete el._id
            });
            setLastWeek_statistic({
                amount, count
            });

            console.log("LAST WEEK AGGREGATE DATA", data);

            setLastWeek(data);

        }, authHeader());
    }


    useEffect(() => {
        fetchYesteday();
        fetchLastWeek();
    }, [])
    

    const yesterday_config_1 = {
        xField: 'hour',
        yField: 'total_amount',
        meta : {
            hour : {
                alias : "Time",
                formatter : (hour) => {
                    
                    if(hour[0] == '0') return hour.substring(1);
                    return hour;
                },
            },
            total_amount : {
                alias : "Amount",
                formatter : (amount) => {
                    return `$ ${commaNumber(amount)}`
                }
            }
        },
        xAxis : {
            tickCount : 24,
        },
        smooth : true
    };

    const yesterday_config_2 = {
        xField: 'hour',
        yField: 'count',
        meta : {
            hour : {
                alias : "Time",
                formatter : (hour) => {
                    
                    if(hour[0] == '0') return hour.substring(1);
                    return hour;
                },
            },
            count : {
                alias : "Invoice Count",
                formatter : (count) => {
                    
                    return `${count} Invoices`
                },
            }
        },
        xAxis : {
            tickCount : 24,
        },
        smooth : true
    };

    const lastWeek_config_1 = {
        xField: 'date',
        yField: 'total_amount',
        meta : {
            date : {
                alias : "Date",
                formatter : (date) => {
                    
                    const d = new Date(date);
                    const mdate = moment(d).format("MMMM d, YYYY (dddd)");
                    console.log(mdate)
                    return mdate;
                },
            },
            total_amount : {
                alias : "Total Amount",
                formatter : (amount) => {
                    
                    return `$ ${commaNumber(amount)}`
                },
            }
        },
        smooth : true
    };

    const lastWeek_config_2 = {
        xField: 'date',
        yField: 'count',
        meta : {
            date : {
                alias : "Date",
                formatter : (date) => {
                    
                    const d = new Date(date);
                    const mdate = moment(d).format("MMMM d, YYYY (dddd)");
                    console.log(mdate)
                    return mdate;
                },
            },
            count : {
                alias : "Invoice Count",
                formatter : (count) => {
                    
                    return `${count} Invoices`
                },
            }
        },
        smooth : true
    };


    return (
        <div className=" statistic-wrapper sheet" style={{minHeight : "90vh"}}>

            <Row>
                <Col span={6}>
                    <div className="statistic-card sheet">
                        <h3>Yesterday</h3>
                        <div className="statistic-container" onMouseOver={() => carousel_ref.current.goTo(0)}>
                            <Row gutter={16} justify="space-between">
                                <Col>
                                    <Statistic loading={!yesterday_statistic} title='Amount' prefix={<DollarOutlined/>} value={yesterday_statistic && commaNumber(yesterday_statistic.amount)} />
                                </Col>
                                <Col>
                                    <Statistic loading={!yesterday_statistic} title='Invoices' prefix={<PlusCircleFilled />} value={yesterday_statistic && commaNumber(yesterday_statistic.count)} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>
                <Col span={6}>
                    <div className="statistic-card sheet">
                        <h3>Last Week</h3>
                        <div className="statistic-container" onMouseOver={() => carousel_ref.current.goTo(1)}>
                            <Row gutter={16} justify="space-between">
                                <Col>
                                    <Statistic loading={!yesterday_statistic} title='Amount' prefix={<DollarOutlined/>} value={lastWeek_statistic && commaNumber(lastWeek_statistic.amount)} />
                                </Col>
                                <Col>
                                    <Statistic loading={!yesterday_statistic} title='Invoices' prefix={<PlusCircleFilled />} value={lastWeek_statistic && commaNumber(lastWeek_statistic.count)} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>
                <Col span={6}>
                    <div className="statistic-card sheet">
                        <h3>Last Month</h3>
                        <div className="statistic-container">
                            <Row gutter={16} justify="space-between">
                                <Col>
                                    <Statistic title='Amount' prefix={<DollarOutlined/>} value={commaNumber(dummyStateData)} />
                                </Col>
                                <Col>
                                    <Statistic title='Invoices' prefix={<PlusCircleFilled />} value={commaNumber(dummyStateDataSmall)} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>
                <Col span={6}>
                    <div className="statistic-card sheet">
                        <h3>Last Year</h3>
                        <div className="statistic-container">
                            <Row gutter={16} justify="space-between">
                                <Col>
                                    <Statistic title='Amount' prefix={<DollarOutlined/>} value={commaNumber(dummyStateData)} />
                                </Col>
                                <Col>
                                    <Statistic title='Invoices' prefix={<PlusCircleFilled />} value={commaNumber(dummyStateDataSmall)} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>
            </Row>

            

            <div className="sheet">
                <Carousel ref={ref => carousel_ref.current = ref} dotPosition='top' autoplay autoplaySpeed={5000}>

                {/* YESTERDAY'S CHART SHEET */}
                <div className='carousel-container'>
                    
                    <div className="sheet menu">
                        <div>
                            <h2>Yesterday's Hourly Data</h2>
                        </div>
                        <Segmented options={["Amount", "Count"]} onChange={(val) => setYesterday_type_amount(val === "Amount")} />
                    </div>
                    {yesterday_type_amount ? 
                    
                        <>
                            <h3>Amount vs Hour</h3>
                            <div className="chart-wrapper">
                                <Area data={yesterday} {...yesterday_config_1}></Area>
                            </div>
                        </>
                    : 
                        <>
                            <h3>Invoice Count vs Hour</h3>
                            <div className="chart-wrapper">
                                <Area data={yesterday} {...yesterday_config_2}></Area>
                            </div>
                        </>
                    }
                    <div>
                    
                    </div>
                    <div>
                        
                    </div>
                </div>

                {/* LAST WEEK'S CHART SHEET */}
                <div className='carousel-container'>
                    
                    <div className="sheet menu">
                        <div>
                            <h2>Last Weeks's Data</h2>
                        </div>
                        <Segmented options={["Amount", "Count"]} onChange={(val) => setLastWeek_type_amount(val === "Amount")} />
                    </div>
                    {lastWeek_type_amount ? 
                    
                        <>
                            <h3>Amount vs Hour</h3>
                            <div className="chart-wrapper">
                                <Area data={lastWeek} {...lastWeek_config_1}></Area>
                            </div>
                        </>
                    : 
                        <>
                            <h3>Invoice Count vs Hour</h3>
                            <div className="chart-wrapper">
                                <Area data={lastWeek} {...lastWeek_config_2}></Area>
                            </div>
                        </>
                    }
                    <div>
                    
                    </div>
                    <div>
                        
                    </div>
                </div>
                    
                </Carousel>
            </div>
            
        </div>
    )
}



export default Dashboard;