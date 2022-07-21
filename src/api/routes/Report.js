import { default as axios } from 'axios';
import express from 'express';
import { authMiddleware } from 'node-mongoose-auth/auth.js';
import moment from 'moment';
import https from "https";
import fs from "fs";
import url from 'url';
import csv from "csvtojson"

const router = express.Router();

import {
    Stripe,
    handleError,
    setCustomStatus,
    notPermitted,
    toTitleCase,
    setTemporaryStatus,
    getAmountAndCountData,
    reportNotPermitted,
} from '../stripe.js';

import Invoice from '../mongo/Invoice.js';

const reportVerbose = (report_type) => {
    const dict = {
        "balance.summary.1" : "Balance - Summary",
        "balance_change_from_activity.summary.1" : "Balance change from activity - Summary",
        "balance_change_from_activity.itemized.3" : "Balance change from activity - Itemized",
        "payouts.summary.1" : "Payouts - Summary",
        "payouts.itemized.3" : "Payouts - Itemized",
        "payout_reconciliation.summary.1" : "Payout reconciliation - Summary",
        "payout_reconciliation.itemized.5" : "Payout reconciliation - Itemized",
        "ending_balance_reconciliation.summary.1" : "Ending balance reconciliation - Summary",
    }

    if(dict.hasOwnProperty(report_type)) return dict[report_type];

    report_type = report_type.replaceAll('.', ' ');
    report_type = report_type.replaceAll('_', ' ');

    return report_type;

}

router.post('/create', authMiddleware, async (req, res) => {
    const data = req.body;

    const user = req.user;
    
    // if(reportNotPermitted(user, data.report_type)) return res.formatter.unauthorized(`You don't have the permission to run a ${reportVerbose(data.report_type)} Report.`);

    const options = {
        report_type : data.report_type,
        parameters : data.parameters
    }

    const reportRun = await Stripe.reporting.reportRuns.create(options);

    return res.formatter.ok(reportRun);
})

router.post('/retrieve', authMiddleware, async (req, res) => {
    const data = req.body;

    const user = req.user;

    // if(reportNotPermitted(user, data.report_type)) return res.formatter.unauthorized(`You don't have the permission to access a ${reportVerbose(data.report_type)} Report.`);

    const reportRun = await Stripe.reporting.reportRuns.retrieve( data.report_id );

    return res.formatter.ok(reportRun);
})

router.post('/file', authMiddleware, async (req, res) => {
    const data = req.body;

    const user = req.user;

    // if(reportNotPermitted(user, data.report_type)) return res.formatter.unauthorized(`You don't have the permission to access a ${reportVerbose(data.report_type)} Report.`);

    // Check if a file link is already present for this file.
    let fileLink;
    try {
        const checkLinks = await Stripe.fileLinks.list({
            file : data.file_id,
            limit: 1,
        });
        
        // If a file link is found, return it.
        if(checkLinks.data.length){
            fileLink = checkLinks.data[0];
        }

    } catch (error) {
        // Create a file link.

        console.log(error.message ? error.message : error);
    }

    if(!fileLink) fileLink = await Stripe.fileLinks.create({
        file: data.file_id,
    });

    // console.log("Fetching data from : " + fileLink.url)
    https.get(fileLink.url,resp => {

        let data = "";

        resp.on("data", (incoming_data) => {
            data += incoming_data;
        })

        resp.on("end", async () => {
            // console.log("data", data);
            const str = data.toString();
            // console.log("converted string", str);
            const csv_data = await csv().fromString(str);
            // console.log("csv data", csv_data);
          return res.formatter.ok({content : csv_data, link : fileLink.url});
        })

        resp.on("error", (error) => {
          console.log(error);
          return res.formatter.serverError(error);
        })

    });

    
    // return res.formatter.ok(fileLink);
})

router.post('/list', authMiddleware,  async (req, res) => {
    
    const data = req.body;
    
    const user = req.user;
    
    // console.log(data);
    // if(notPermitted(user, "access_reports")) return res.formatter.unauthorized("You don't have the permission to access Reports.");

    const options = {
        created : data.created,
        ending_before : data.ending_before,
        limit : data.limit || 10,
        starting_after : data.starting_after
    }
    
    const reports = await Stripe.reporting.reportRuns.list(options);
    // console.log(reports);
    return res.formatter.ok(reports);

})


// DASHBOARD ROUTES

router.post('/dashboard/day', async (req, res) => {

    const data = req.body;

    // const start = data.start
    const end = data.end

    // previous month
    let start = moment().subtract(2, "year").startOf("month").startOf("day").unix();
    // let end_date = moment().subtract(0, "month").endOf("month").endOf("day").unix();
    
    const aggr = await Invoice.aggregate([
        {
            $match : {
                created : {
                    $gte : start,
                    $lte : end
                },
                // status : "open"
            }
        },
        {
            $group : {
                _id : {
                    hour : {
                        $hour : "$created_date"
                    }
                },
                count : { $sum : 1 },
                total_amount : {
                    $sum : "$amount_due"
                },

            }
        },
        {$sort: {_id: 1}}
    ]);

    return res.formatter.ok(aggr);
    

})

router.post('/dashboard/custom', async (req, res) => {

    const data = req.body;

    // const start = data.start
    // const end = data.end

    // previous month
    let start = moment().subtract(2, "year").startOf("month").startOf("day").unix();
    let end = moment().subtract(0, "month").endOf("month").endOf("day").unix();
    
    const aggr = await Invoice.aggregate([
        {
            $match : {
                created : {
                    $gte : data.start,
                    $lte : data.end
                },
                // status : "open"
            }
        },
        {
            $group : {
                "_id": {
                    "year": { "$year": "$created_date"},
                        "month": { "$month": "$created_date"},
                        "day": { "$dayOfMonth": "$created_date"}
                },
                count : { $sum : 1 },
                total_amount : {
                    $sum : "$amount_due"
                },

            }
        },
        {$sort: {_id: 1}}
    ]);

    return res.formatter.ok(aggr);
    

})

router.post('/dashboard/week', async (req, res) => {

    const data = req.body;

    // const start = data.start
    // const end = data.end

    // previous month
    let start = moment().subtract(2, "year").startOf("month").startOf("day").unix();
    let end = moment().subtract(0, "month").endOf("month").endOf("day").unix();
    
    const aggr = await Invoice.aggregate([
        {
            $match : {
                created : {
                    $gte : start,
                    $lte : end
                },
                // status : "open"
            }
        },
        {
            $group : {
                "_id": {
                    "year": { "$year": "$created_date"},
                        "month": { "$month": "$created_date"},
                        "day": { "$dayOfMonth": "$created_date"}
                },
                count : { $sum : 1 },
                total_amount : {
                    $sum : "$amount_due"
                },

            }
        },
        {$sort: {_id: 1}}
    ]);

    return res.formatter.ok(aggr);
    

})

router.post('/dashboard/month', async (req, res) => {

    const data = req.body;

    // const start = data.start
    // const end = data.end

    // previous month
    let start = moment().subtract(2, "year").startOf("month").startOf("day").unix();
    let end = moment().subtract(0, "month").endOf("month").endOf("day").unix();
    
    const aggr = await Invoice.aggregate([

        {
            $match : {
                created : {
                    $gte : start,
                    $lte : end
                },
                // status : "open"
            }
        },
        {
            $group : {
                "_id": {
                    "year": { "$year": "$created_date"},
                        "month": { "$month": "$created_date"},
                        "day": { "$dayOfMonth": "$created_date"}
                },
                count : { $sum : 1 },
                total_amount : {
                    $sum : "$amount_due"
                },

            }
        },
        {$sort: {_id: 1}}
    
    ]);

    return res.formatter.ok(aggr);
    

})

router.post('/dashboard/year', async (req, res) => {

    const data = req.body;

    // const start = data.start
    // const end = data.end

    // previous month
    let start = moment().subtract(1, "year").startOf("year").startOf("day").unix();
    let end = moment().subtract(1, "year").endOf("year").endOf("day").unix();
    
    const aggr = await Invoice.aggregate([

        {
            $match : {
                created : {
                    $gte : start,
                    $lte : end
                },
                // status : "open"
            }
        },
        {
            $group : {
                "_id": {
                    "year": { "$year": "$created_date"},
                        "month": { "$month": "$created_date"},
                },
                count : { $sum : 1 },
                total_amount : {
                    $sum : "$amount_due"
                },

            }
        },
        {$sort: {_id: 1}}
    
    ]);

    return res.formatter.ok(aggr);
    
})

export default router; 