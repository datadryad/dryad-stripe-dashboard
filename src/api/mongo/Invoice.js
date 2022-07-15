import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema(
    {
        type : mongoose.Schema.Types.Mixed
    },
    {
        strict : false,
        _id : false
    }
)

const Invoice = mongoose.model("Invoice", InvoiceSchema);

export default Invoice;