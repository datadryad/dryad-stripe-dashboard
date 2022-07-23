import ordinal from 'ordinal';
import { User } from 'node-mongoose-auth';
import Invoice from './mongo/Invoice.js';
import StripeFactory from 'stripe';

export const Stripe = StripeFactory('sk_test_fX9EovHjWMI7pR7saJuJ6Cka');
// export const Stripe = StripeFactory('sk_test_51LIUymSIt9fpyvh6mswNEo5zCGruv8fBzLEm88rgrktfE9ZCfIz6W5AitmHbzm58hCCMs08CLEuKXo2b2aD2o2jo00MXP01MiL');

export const handleError = (res, err) => {
    console.error(err);
    if(err.statusCode) return res.status(err.statusCode).json(err);
    return res.json(err);
}

export const setCustomStatus = async (invoice_id, status) => {
    let invoice = await Stripe.invoices.update(
        invoice_id,
        {
            metadata : {
                custom_status : status
            }
        }
    )

    return invoice;
};

export const setTemporaryStatus = async (invoice_id, temporary_status) => {
    let invoice = await Stripe.invoices.update(
        invoice_id,
        {
            metadata : {
                marked_status : temporary_status
            }
        }
    )

    return invoice;
};

export const notPermitted = (user, permission_type, permission) => {

    const permissions = user.get(permission_type);

    if(permissions.hasOwnProperty(permission_type) && ( permissions[permission_type][permission] !== "false" )) return false;

    return true;
}

export const reportNotPermitted = (user, permission) => {
    if(!user.permissions.has("report")) return true;
    const perms = user.permissions.get("report");
    
    const rep_permission = permission.replaceAll('.', '_');
    if(!perms.has(rep_permission) || perms.get(rep_permission) === "false") return true;

    return false;
}

export function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
}

export const getAmountAndCountData = async (start_time, end_time) => {
    const start_secs = start_time.unix();
    const end_secs = end_time.unix();

    let total_amount = 0, total_count = 0, current_dataset = { data : [], has_more : true};

    while(current_dataset.has_more){

        const listObject = {
            created : {
                gte : start_secs,
                lte : end_secs
            },
            // status : 'paid', // Currently no records with paid status
            limit : 100,
        }
        const count = current_dataset.data.length;
        if(count) listObject["starting_after"] = current_dataset.data[count - 1].id;

        const invoices = await Stripe.invoices.list(listObject);

        console.log(invoices);

        current_dataset.data = invoices.data;
        current_dataset.has_more = invoices.has_more;
        
        current_dataset.data.forEach((invoice) => {
            
            total_count++;
            
            total_amount += invoice.amount_paid;

        })
    }

    return {
        total_amount, total_count
    }
}

export const initiateRestore = async () => {
    // const first_record = await Stripe.invoices.list({
    //     limit : 1
    // });

    let current_dataset = { data : [], has_more : true};

    const latest_local_record = await Invoice.findOne({},{},{sort : { created : -1 }});
    let fetching_all = false;

    if(latest_local_record){
        const latest_local_record_object = latest_local_record.toObject();
        
        console.log("Latest saved Invoice record found is : ", latest_local_record_object._id);
        console.log("Looking for any Invoice records created after the latest local invoice...");
        
        try {
            await Stripe.invoices.retrieve(latest_local_record_object._id);
            current_dataset.data.push({id : latest_local_record_object._id});
        } catch (error) {
            console.log("Couldn't find latest saved Invoice from local db in Stripe account, deleting all local records and fetching all Invoices from Stripe to avoid any discrepancies.")
            await Invoice.deleteMany({});
            fetching_all = true;
        }
    }else{
        fetching_all = true;
        console.log("No saved Invoice records found locally. Initiating restore...");
        console.log("Fetching all Invoice records...");
    }

    
    let inv_count = 0, inv_index = 1;
    console.log("Starting Sync...")
    while(current_dataset.has_more){

        const listObject = {
            // status : 'paid', // Currently no records with paid status
            limit : 100,
            // starting_after : undefined
        }

        if(current_dataset.data.length) listObject[fetching_all ? "starting_after" : "ending_before"] = current_dataset.data[current_dataset.data.length - 1].id;

        const invoices = await Stripe.invoices.list(listObject);
        
        if(!invoices.data.length){
            console.log("Local database up to date!");
            break;
        }
        
        current_dataset.data = invoices.data;
        current_dataset.has_more = invoices.has_more;

        console.log(`[ ${ordinal(inv_index++)} Fetch ] Updating local database with ${current_dataset.data.length} new Invoice records...`);
        
        inv_count += current_dataset.data.length;

        current_dataset.data.forEach((invoice) => {
            invoice.created_date = new Date(invoice.created * 1000);
        })
        
        await Invoice.bulkWrite(
            current_dataset.data.map((invoice) => 
              ({
                updateOne: {
                  filter: { _id : invoice.id },
                  update: { $set: invoice },
                  upsert: true
                }
              })
            )
        )
        break;
        
    }

    console.log("Finished restore! Local database bas been updated with a total of " + inv_count + " new Invoice records.");
return;

    const aggregate = await Invoice.aggregate(
        {
            $group : {
                _id : null,
                count : { $sum : 1 },
                total_amount : {
                    $sum : "$amount_due"
                }
            }
        }
    )

    console.log(aggregate);
}



