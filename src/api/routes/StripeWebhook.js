import { ConsoleSqlOutlined } from '@ant-design/icons';
import express from 'express';
import stripe from 'stripe';
import Update from '../mongo/Update.js';

const endpointSecret = "whsec_091046be6b9646bf7b6d100ab91d32fd4cc21646b147821de14af61910fba0bd";



const router = express.Router();


router.post('/listen', express.raw({type: 'application/json'}), async (req, res) => {
    
    const signature = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    } catch (error) {
        console.log(error);
        res.status(400).send(`Webhook Error: ${error.message}`);
        return;
    }
    const UpdateObject = {
        event_id : event.id,
        resource_id : event.data.object.id,
        created : event.created,
        type : event.type,
        snapshot : event,
    }
    console.log("Recieved an event : ", UpdateObject);

    try {
        const mongooseUpdateObject = new Update(UpdateObject);
        // mongooseUpdateObject.save();

        const updates = await Update.find();

        console.log("HERE ARE THE UPDATES");
        updates.forEach(element => {
            console.log(element.toObject())
        });
    } catch (error) {
        console.log(error);
    }

    res.send();

})


export default router;