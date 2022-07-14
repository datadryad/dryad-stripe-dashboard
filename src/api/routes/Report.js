const { default: axios } = require('axios');
const express = require('express');
const { authMiddleware } = require('node-mongoose-auth/auth');
const moment = require('moment')
const router = express.Router();

const {Stripe, handleError, setCustomStatus, notPermitted, toTitleCase, setTemporaryStatus, getAmountAndCountData} = require("../stripe");
const Invoice = require('../mongo/Invoice');

router.post('/test', async (req, res) => {


    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 2);
    const currentSeconds = Math.round(currentDate/1000);
    const prevDate = new Date();
    if(prevDate.getMonth > 0) prevDate.setMonth(prevDate.getMonth() - 1);
    else{
        prevDate.setMonth(11);
        prevDate.setFullYear(prevDate.getFullYear() - 1);
    }
    const prevSeconds = Math.round(prevDate/1000);

    console.log(prevSeconds, currentSeconds);

    const reportRun = await Stripe.reporting.reportRuns.create({
        report_type : "balance.summary.1",
        parameters : {
            interval_start : prevSeconds,
            interval_end : currentSeconds
        }
    })

    return res.formatter.ok(reportRun);
})

router.post('/dashboard/day', async (req, res) => {

    const data = req.body;

    // const start = data.start
    const end = data.end

    // previous month
    let start = moment().subtract(2, "year").startOf("month").startOf("day").unix();
    // let end_date = moment().subtract(0, "month").endOf("month").endOf("day").unix();
    
    const aggr = await Invoice.aggregate(
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
    );

    return res.formatter.ok(aggr);
    

})

router.post('/dashboard/week', async (req, res) => {

    const data = req.body;

    // const start = data.start
    // const end = data.end

    // previous month
    let start = moment().subtract(2, "year").startOf("month").startOf("day").unix();
    let end = moment().subtract(0, "month").endOf("month").endOf("day").unix();
    
    const aggr = await Invoice.aggregate(
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
    );

    return res.formatter.ok(aggr);
    

})

router.post('/retrieve', async (req, res) => {
    // console.log(req.body)
    // return;
    const reportRun = await Stripe.reporting.reportRuns.retrieve(
        req.body.report_run_id
      );
    
    let data = {};
    if(reportRun.result && reportRun.result.url){
        console.log(reportRun.result.url)
        const file = await axios({
            method : "get",
            url : reportRun.result.url,
            auth : {
                username : "sk_test_fX9EovHjWMI7pR7saJuJ6Cka",
                password : "test"
            }
        }).then((response, error) => {
            data = response.data;
            console.log(data)
        }).catch((error) => {
            console.log(error.response);
        })
    }



    return res.formatter.ok({
        reportRun,
        data
    });
} )

module.exports = router 