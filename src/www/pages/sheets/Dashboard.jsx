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

    const [lastMonth, setLastMonth] = useState([]);
    const [lastMonth_statistic, setLastMonth_statistic] = useState(false);
    const [lastMonth_type_amount, setLastMonth_type_amount] = useState(true);

    const [lastYear, setLastYear] = useState([]);
    const [lastYear_statistic, setLastYear_statistic] = useState(false);
    const [lastYear_type_amount, setLastYear_type_amount] = useState(true);

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

                el.total_amount /= 100;

                el.hour = moment(date).format("hh a");
                count += el.count;
                amount += el.total_amount
                delete el._id
            });
            setYesterday_statistic({
                amount, count, amount_avg : Math.round(amount/data.length), count_avg : Math.round(count/data.length)
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

                el.date = `${el._id.year}/${el._id.month}/${el._id.day}`;
                
                el.total_amount /= 100;
                
                count += el.count;
                amount += el.total_amount
                delete el._id
            });

            console.log(data)

            setLastWeek_statistic({
                amount, count, amount_avg : Math.round(amount/data.length), count_avg : Math.round(count/data.length)
            });

            console.log("LAST WEEK AGGREGATE DATA", data);

            setLastWeek(data);

        }, authHeader());
    }

    const fetchLastYear = () => {

        let last_year = moment().subtract(1, "month");
        let start = last_year.startOf("day").unix();
        let end = last_year.endOf("day").unix();
    
        apiCall("/reports/dashboard/year", {start, end}, (response) => {
            const data = response.data.data;


            let amount = 0, count = 0;
            data.forEach(el => {

                el.date = `${el._id.year}/${el._id.month}`;
                
                el.total_amount /= 100;

                count += el.count;
                amount += el.total_amount
                delete el._id
            });

            

            setLastYear_statistic({
                amount, count, amount_avg : Math.round(amount/data.length), count_avg : Math.round(count/data.length)
            });

            console.log("LAST YEAR AGGREGATE DATA", data);
            setTimeout(() => {
                console.log(lastYear_statistic)
            }, 1000);

            setLastYear(data);

        }, authHeader());
    }

    const fetchLastMonth = () => {

        let last_month = moment().subtract(1, "month");
        let start = last_month.startOf("day").unix();
        let end = last_month.endOf("day").unix();
    
        apiCall("/reports/dashboard/week", {start, end}, (response) => {
            const data = response.data.data;


            let amount = 0, count = 0;
            data.forEach(el => {

                el.date = `${el._id.year}/${el._id.month}/${el._id.day}`;
                
                el.total_amount /= 100;
                
                count += el.count;
                amount += el.total_amount
                delete el._id
            });

            console.log(data)

            setLastMonth_statistic({
                amount, count, amount_avg : Math.round(amount/data.length), count_avg : Math.round(count/data.length)
            });

            console.log("LAST MONTH AGGREGATE DATA", data);

            setLastMonth(data);

        }, authHeader());
    }

    const getYesterdayStatsData = (key) => {
        if(yesterday_statistic) return yesterday_statistic[key];
        else return 0;
    }

    const getLastWeekStatsData = (key) => {
        if(lastWeek_statistic) return lastWeek_statistic[key];
        else return 0;
    }

    const getLastMonthStatsData = (key) => {
        if(lastMonth_statistic) return lastMonth_statistic[key];
        else return 0;
    }

    const getLastYearStatsData = (key) => {
        if(lastYear_statistic) return lastYear_statistic[key];
        else return 0;
    }


    useEffect(() => {
        fetchYesteday();
        fetchLastWeek();
        fetchLastMonth();
        fetchLastYear();
    }, [])

    const annotationLineStyles = {
        stroke : "rgb(80, 80, 80)",
        lineDash : [10, 5],
        lineWidth : 2,
        opacity : 0.75
    };

    const gradientFill = {
        fill: 'l(270) 0:#af7bb4b2 1:#165481ad',
    };

    const yesterday_config_1 = {
        xField: 'hour',
        yField: 'total_amount',
        annotations : [
            {
                type : "text",
                position : ['min', getYesterdayStatsData("amount_avg")],
                content : `Average Amount : $${commaNumber(getYesterdayStatsData("amount_avg"))}`,
                offsetY : -4,
                style : {
                    textBaseline : "bottom"
                }
            },
            {
                type : "line",
                start : ['min', getYesterdayStatsData("amount_avg")],
                end : ['max', getYesterdayStatsData("amount_avg")],
                style : annotationLineStyles
            }
        ],
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
        smooth : true,
        areaStyle : gradientFill
    };
    

    const yesterday_config_2 = {
        xField: 'hour',
        yField: 'count',
        annotations : [
            {
                type : "text",
                position : ['min', getYesterdayStatsData("count_avg")],
                content : `Average Count : ${commaNumber(getYesterdayStatsData("count_avg"))} Invoices`,
                offsetY : -4,
                style : {
                    textBaseline : "bottom"
                }
            },
            {
                type : "line",
                start : ['min', getYesterdayStatsData("count_avg")],
                end : ['max', getYesterdayStatsData("count_avg")],
                style : annotationLineStyles
            }
        ],
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
        annotations : [
            {
                type : "text",
                position : ['min', getLastWeekStatsData("amount_avg")],
                content : `Average Amount : $${commaNumber(getLastWeekStatsData("amount_avg"))}`,
                offsetY : -4,
                style : {
                    textBaseline : "bottom"
                }
            },
            {
                type : "line",
                start : ['min', getLastWeekStatsData("amount_avg")],
                end : ['max', getLastWeekStatsData("amount_avg")],
                style : annotationLineStyles
            }
        ],
        meta : {
            date : {
                alias : "Date",
                formatter : (date) => {
                    // const mdate = moment(date, 'YYYY/M/D').format("MMMM d, YYYY (dddd)");
                    const mdate = moment(date, 'YYYY/M/D').format("dddd, Do MMMM");

                    return mdate;
                }
            },
            total_amount : {
                alias : "Total Amount",
                formatter : (amount) => {
                    
                    return `$ ${commaNumber(amount)}`
                },
            }
        },
        smooth : true,
        areaStyle : gradientFill
    };

    const lastWeek_config_2 = {
        xField: 'date',
        yField: 'count',
        annotations : [
            {
                type : "text",
                position : ['min', getLastWeekStatsData("count_avg")],
                content : `Average Count : ${commaNumber(getLastWeekStatsData("count_avg"))} Invoices`,
                offsetY : -4,
                style : {
                    textBaseline : "bottom"
                }
            },
            {
                type : "line",
                start : ['min', getLastWeekStatsData("count_avg")],
                end : ['max', getLastWeekStatsData("count_avg")],
                style : annotationLineStyles
            }
        ],
        meta : {
            date : {
                alias : "Date",
                formatter : (date) => {
                    
                    // const mdate = moment(date, 'YYYY/M/D').format("MMMM d, YYYY (dddd)");
                    const mdate = moment(date, 'YYYY/M/D').format("dddd, DD MMMM");

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
        smooth : true,
        areaStyle : gradientFill
    };

    const lastMonth_config_1 = {
        xField: 'date',
        yField: 'total_amount',
        annotations : [
            {
                type : "text",
                position : ['min', getLastMonthStatsData("amount_avg")],
                content : `Average Amount : $${commaNumber(getLastMonthStatsData("amount_avg"))}`,
                offsetY : -4,
                style : {
                    textBaseline : "bottom"
                }
            },
            {
                type : "line",
                start : ['min', getLastMonthStatsData("amount_avg")],
                end : ['max', getLastMonthStatsData("amount_avg")],
                style : annotationLineStyles
            }
        ],
        meta : {
            date : {
                alias : "Date",
                formatter : (date) => {
                    const mdate = moment(date, 'YYYY/M/D').format("Do MMM, YYYY (ddd)");

                    return mdate;
                }
            },
            total_amount : {
                alias : "Total Amount",
                formatter : (amount) => {
                    
                    return `$ ${commaNumber(amount)}`
                },
            }
        },
        smooth : true,
        areaStyle : gradientFill
    };

    const lastMonth_config_2 = {
        xField: 'date',
        yField: 'count',
        annotations : [
            {
                type : "text",
                position : ['min', getLastMonthStatsData("count_avg")],
                content : `Average Count : ${commaNumber(getLastMonthStatsData("count_avg"))} Invoices`,
                offsetY : -4,
                style : {
                    textBaseline : "bottom"
                }
            },
            {
                type : "line",
                start : ['min', getLastMonthStatsData("count_avg")],
                end : ['max', getLastMonthStatsData("count_avg")],
                style : annotationLineStyles
            }
        ],
        meta : {
            date : {
                alias : "Date",
                formatter : (date) => {
                    
                    const mdate = moment(date, 'YYYY/M/D').format("MMMM d, YYYY (dddd)");

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
        smooth : true,
        areaStyle : gradientFill
    };

    const lastYear_config_1 = {
        xField: 'date',
        yField: 'total_amount',
        annotations : [
            {
                type : "text",
                position : ['min', getLastYearStatsData("amount_avg")],
                content : `Average Amount : $${commaNumber(getLastYearStatsData("amount_avg"))}`,
                offsetY : -4,
                style : {
                    textBaseline : "bottom"
                }
            },
            {
                type : "line",
                start : ['min', getLastYearStatsData("amount_avg")],
                end : ['max', getLastYearStatsData("amount_avg")],
                style : annotationLineStyles
            }
        ],
        meta : {
            date : {
                alias : "Date",
                formatter : (date) => {
                    const mdate = moment(date, 'YYYY/M').format("Do MMM, YYYY (ddd)");

                    return mdate;
                }
            },
            total_amount : {
                alias : "Total Amount",
                formatter : (amount) => {
                    
                    return `$ ${commaNumber(amount)}`
                },
            }
        },
        smooth : true,
        areaStyle : gradientFill
    };

    const lastYear_config_2 = {
        xField: 'date',
        yField: 'count',
        annotations : [
            {
                type : "text",
                position : ['min', getLastYearStatsData("count_avg")],
                content : `Average Count : ${commaNumber(getLastYearStatsData("count_avg"))} Invoices`,
                offsetY : -4,
                style : {
                    textBaseline : "bottom"
                }
            },
            {
                type : "line",
                start : ['min', getLastYearStatsData("count_avg")],
                end : ['max', getLastYearStatsData("count_avg")],
                style : annotationLineStyles
            }
        ],
        meta : {
            date : {
                alias : "Date",
                formatter : (date) => {
                    
                    const mdate = moment(date, 'YYYY/M').format("MMMM d, YYYY (dddd)");

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
        smooth : true,
        areaStyle : gradientFill
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
                                    <Statistic loading={!lastWeek_statistic} title='Amount' prefix={<DollarOutlined/>} value={lastWeek_statistic && commaNumber(lastWeek_statistic.amount)} />
                                </Col>
                                <Col>
                                    <Statistic loading={!lastWeek_statistic} title='Invoices' prefix={<PlusCircleFilled />} value={lastWeek_statistic && commaNumber(lastWeek_statistic.count)} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>
                <Col span={6}>
                    <div className="statistic-card sheet">
                        <h3>Last Month</h3>
                        <div className="statistic-container" onMouseOver={() => carousel_ref.current.goTo(2)}>
                            <Row gutter={16} justify="space-between">
                                <Col>
                                    <Statistic loading={!lastMonth_statistic} title='Amount' prefix={<DollarOutlined/>} value={lastMonth_statistic && commaNumber(lastMonth_statistic.amount)} />
                                </Col>
                                <Col>
                                    <Statistic loading={!lastMonth_statistic} title='Invoices' prefix={<PlusCircleFilled />} value={lastMonth_statistic && commaNumber(lastMonth_statistic.count)} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>
                <Col span={6}>
                    <div className="statistic-card sheet">
                        <h3>Last Yar</h3>
                        <div className="statistic-container" onMouseOver={() => carousel_ref.current.goTo(3)}>
                            <Row gutter={16} justify="space-between">
                                <Col>
                                    <Statistic loading={!lastYear_statistic} title='Amount' prefix={<DollarOutlined/>} value={lastYear_statistic && commaNumber(lastYear_statistic.amount)} />
                                </Col>
                                <Col>
                                    <Statistic loading={!lastYear_statistic} title='Invoices' prefix={<PlusCircleFilled />} value={lastYear_statistic && commaNumber(lastYear_statistic.count)} />
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
                            <h3>Amount vs Date</h3>
                            <div className="chart-wrapper">
                                <Area data={lastWeek} {...lastWeek_config_1}></Area>
                            </div>
                        </>
                    : 
                        <>
                            <h3>Invoice Count vs Date</h3>
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

                {/* LAST MONTH'S CHART SHEET */}
                <div className='carousel-container'>
                    
                    <div className="sheet menu">
                        <div>
                            <h2>Last Month's Data</h2>
                        </div>
                        <Segmented options={["Amount", "Count"]} onChange={(val) => setLastMonth_type_amount(val === "Amount")} />
                    </div>
                    {lastMonth_type_amount ? 
                    
                        <>
                            <h3>Amount vs Date</h3>
                            <div className="chart-wrapper">
                                <Area data={lastMonth} {...lastMonth_config_1}></Area>
                            </div>
                        </>
                    : 
                        <>
                            <h3>Invoice Count vs Date</h3>
                            <div className="chart-wrapper">
                                <Area data={lastMonth} {...lastMonth_config_2}></Area>
                            </div>
                        </>
                    }
                    <div>
                    
                    </div>
                    <div>
                        
                    </div>
                </div>

                {/* LAST YEAR'S CHART SHEET */}
                <div className='carousel-container'>
                    
                    <div className="sheet menu">
                        <div>
                            <h2>Last Year's Data</h2>
                        </div>
                        <Segmented options={["Amount", "Count"]} onChange={(val) => setLastYear_type_amount(val === "Amount")} />
                    </div>
                    {lastYear_type_amount ? 
                    
                        <>
                            <h3>Amount vs Date</h3>
                            <div className="chart-wrapper">
                                <Area data={lastYear} {...lastYear_config_1}></Area>
                            </div>
                        </>
                    : 
                        <>
                            <h3>Invoice Count vs Date</h3>
                            <div className="chart-wrapper">
                                <Area data={lastYear} {...lastYear_config_2}></Area>
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