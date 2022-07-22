import { ConsoleSqlOutlined } from '@ant-design/icons';
import express from 'express';
import stripe from 'stripe';
import WebSocket, { WebSocketServer } from 'ws';
import { sendNotificationToAllActiveSessions } from '../Websocket_utils.js';



const endpointSecret = "whsec_b0329a1720b7e2e47daa28b998870496263f2f172eeae0588cdf42d6ea7d1725";

const router = express.Router();

router.post('/updates', express.raw({type: 'application/json'}), async (req, res) => {
    
    const signature = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
        console.log(event.type, event.data.object.id);
        if(event.type === "reporting.report_run.succeeded"){
            await sendNotificationToAllActiveSessions(event.data.object.id, event.data.object);
        }
    } catch (error) {
        console.log(error);
        res.status(400).send(`Webhook Error: ${error.message}`);
        return;
    }

    res.send();

})


export default router;