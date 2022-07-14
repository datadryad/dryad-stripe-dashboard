const mongoose = require("mongoose")

const UpdateSchema = new mongoose.Schema({
    resource_id : {
        type : String,
        required : true,
    },
    event_id : {
        type : String,
        required : true
    },
    created : {
        type : Number,
        required : true
    },
    type : {
        type : String,
        required : true
    },
    snapshot : {
        type : mongoose.Schema.Types.Mixed,
        required : true
    },
    origin_date : {
        type : Date,
        expires : "30d",
        default : Date.now()
    }
})

const update = mongoose.model("Update", UpdateSchema);

module.exports = update;