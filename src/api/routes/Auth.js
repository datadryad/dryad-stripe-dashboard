import express from 'express';
import { adminMiddleware, authMiddleware } from 'node-mongoose-auth/auth.js';
import Invoice from '../mongo/Invoice.js';
import { handleError } from '../stripe.js';
import { User } from "node-mongoose-auth";

const router = express.Router();


// router.post('/permit', adminMiddleware, async (req, res) => {
router.post('/permit', async (req, res) => {

    const data = req.body;
    console.log({
        $set : data.permission_updates
    });
    User.findOneAndUpdate(
        {
            _id : data.user_id
        },
        {
            $set : data.permission_updates
        },
        {
            new : true
        },
        (err, user) => {
            console.log(err, user);
            return res.formatter.ok(user);
        }
    )
})
router.post('/withdraw', async (req, res) => {

    const data = req.body;
    User.findOneAndUpdate(
        {
            _id : data.user_id
        },
        {
            $set : {
                [`${data.permit_type}.${data.permit_role}`] : "false"
            }
        },
        {
            new : true
        },
        (err, user) => {
            console.log(err);
            return res.formatter.ok(user);
        }
    )
})

// router.post('/list', adminMiddleware, async (req, res) => {
router.post('/list', async (req, res) => {
    console.log(User);
    let user;
    try {
        user = await Invoice.find();
    } catch (error) {
        user = error;
    }

    return res.json(user);
})

// router.post('/delete', adminMiddleware, async (req, res) => {
router.post('/delete', async (req, res) => {
    const data = req.body;
    
})



export default router; 