import express from 'express';
import { User } from 'node-mongoose-auth';

const router = express.Router();


router.post('/permit', async (req, res) => {

    const data = req.body;
    User.findOneAndUpdate(
        {
            _id : data.user_id
        },
        {
            $set : {
                [`permissions.${data.permit_role}`] : "true"
            }
        },
        {
            new : true
        },
        (err, user) => {

            return res.formatter.ok(user);
        }
    )

    
    

})



export default router; 