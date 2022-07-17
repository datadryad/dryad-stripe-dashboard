import express from 'express';
import { authMiddleware } from 'node-mongoose-auth/auth.js';

const router = express.Router();

import {
    Stripe,
    handleError,
    setCustomStatus,
    notPermitted,
    toTitleCase,
    setTemporaryStatus,
} from '../stripe.js';

router.post('/list', async (req, res) => {

    const data = req.body;

    const options = {
        collection_method : data.collection_method,
        created : data.created,
        due_date : data.due_date,
        ending_before : data.ending_before,
        limit : data.limit || 10,
        starting_after : data.starting_after
    }
    
    const invoices = await Stripe.invoices.list(options);

    return res.formatter.ok(invoices);
    

})

router.post('/retrieve', authMiddleware, async (req, res) => {
    const data = req.body;

    const user = req.user;
    
    if(!data.invoice_id) return res.formatter.badRequest("Missing Invoice ID.");
    if(notPermitted(user, "view_invoice")) return res.formatter.unauthorized("You don't have the permission to view invoices.");

    try {
        const invoice = await Stripe.invoices.retrieve(data.invoice_id);
        
        return res.formatter.ok(invoice);

    } catch (err) {
        return handleError(res, err);
    }
})

router.post('/update/:action', authMiddleware, async (req, res) => {
    const data = req.body;

    const action = req.params.action;
    const invoice_id = data.invoice_id;
    const user = req.user;

    if(!action) return res.formatter.badRequest("Missing action.");
    if(!invoice_id) return res.formatter.badRequest("Missing invoice ID.");
    if(notPermitted(user, "set_" + action)){
        let s = action;
        s = toTitleCase(action);
        s = s.replaceAll('_', ' '); 
        return res.formatter.unauthorized(`You are not authorized to change status of Invoices to ${s}.`);
    }

    if(![
        'paid', 
        'invoiced_in_error',
        'waiver',
        'voucher',
        "refund",
        "uncollectible"
    ].includes(action)) return res.formatter.badRequest("Invalid action attempted.");

    try {
        let invoice = {};

        switch (action) {
            // case 'finalize':
            //     invoice = await Stripe.invoices.finalizeInvoice(invoice_id);
            //     break;
        
            case 'invoiced_in_error':
                invoice  = await Stripe.invoices.voidInvoice(invoice_id);
                invoice = setCustomStatus(invoice_id, "invoiced_in_error");
                break;
            
            case 'paid':
                invoice = await Stripe.invoices.pay(invoice_id);
                invoice = setCustomStatus(invoice_id, "paid");

                break;
        
            case 'uncollectible':
                invoice = await Stripe.invoices.markUncollectible(invoice_id);
                invoice = setCustomStatus(invoice_id, "uncollectible");

                break;

            case 'waiver':
                invoice = setCustomStatus(invoice_id, "waiver");

                break;

            case 'voucher':
                invoice = setCustomStatus(invoice_id, "voucher");

                break;

            case 'refund':
                invoice = await Stripe.invoices.retrieve(invoice_id);
                const charge = invoice.charge;
                console.log(charge);
                return;
                let refund = await Stripe.refunds.create({ charge });

                invoice = setCustomStatus(invoice_id, "refund");

                break;
        
            default:
                break;
        }
        return res.formatter.ok(invoice);
    } catch (err) {
        return handleError(res, err);
    }
})

router.post('/update/label/:action', authMiddleware, async (req, res) => {
    const data = req.body;

    const action = req.params.action;
    const invoice_id = data.invoice_id;
    const user = req.user;

    if(!action) return res.formatter.badRequest("Missing action.");
    if(!invoice_id) return res.formatter.badRequest("Missing invoice ID.");
    if(notPermitted(user, "set_to_be_" + action)){
        let s = action;
        s = toTitleCase(action);
        s = s.replaceAll('_', ' '); 
        return res.formatter.unauthorized(`You are not authorized to ch ange status of Invoices to ${toTitleCase(s)}.`);
    }

    if(![
        'paid', 
        'invoiced_in_error',
        'waiver',
        'voucher',
        "refund",
        "uncollectible"
    ].includes(action)) return res.formatter.badRequest("Invalid action attempted.");

    try {
        const invoice = await setTemporaryStatus(invoice_id, action);
        return res.formatter.ok(invoice);
    } catch (err) {
        return handleError(res, err);
    }
})



export default router; 