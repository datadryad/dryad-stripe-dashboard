const { User } = require('node-mongoose-auth');

const Stripe = require('stripe')('sk_test_51LIUymSIt9fpyvh6mswNEo5zCGruv8fBzLEm88rgrktfE9ZCfIz6W5AitmHbzm58hCCMs08CLEuKXo2b2aD2o2jo00MXP01MiL');

const handleError = (res, err) => {
    // console.error(err);
    return res.status(err.statusCode).json(err);
}

const setCustomStatus = async (invoice_id, status) => {
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

const setTemporaryStatus = async (invoice_id, temporary_status) => {
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

const notPermitted = (user, permission) => {
    if(!user.permissions.has(permission)) return true;
    if(user.permissions.get(permission) === "false") return true;

    return false;
}

function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }

module.exports = { Stripe, handleError, setCustomStatus, notPermitted, toTitleCase, setTemporaryStatus }