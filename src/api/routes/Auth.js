import express from 'express';
import { adminMiddleware, authMiddleware } from 'node-mongoose-auth/auth.js';
import { handleError, notPermitted } from '../stripe.js';
import { User } from "node-mongoose-auth";

const router = express.Router();


// router.post('/permit', adminMiddleware, async (req, res) => {
router.post('/permit', authMiddleware, async (req, res) => {

    const data = req.body;
    const user = req.user;

    if(!(user.isAdmin || notPermitted(user, "general_permissions", "manage_users"))){
        return handleError(res, "You are not authorized to manage Users.")
    }
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
router.post('/withdraw', authMiddleware, async (req, res) => {

    const data = req.body;
    const user = req.user;

    if(!(user.isAdmin || notPermitted(user, "general_permissions", "manage_users"))){
        return handleError(res, "You are not authorized to manage Users.")
    }
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


router.post('/list', authMiddleware, async (req, res) => {

    const data = req.body;
    const user = req.user;

    if(!(user.isAdmin || notPermitted(user, "general_permissions", "manage_users"))){
        return handleError(res, "You are not authorized to manage Users.")
    }

    User.find({}).limit(10).select("email isActive general_permissions invoice_permissions report_permissions").sort({createdAt : -1}).exec((err, resp) => {
        if(err){
            console.log(err);
            return handleError(res, err);
        }

        return res.formatter.ok(resp);
    })

})

// router.post('/delete', adminMiddleware, async (req, res) => {
router.post('/delete', async (req, res) => {
    const data = req.body;
    
})



export default router; 