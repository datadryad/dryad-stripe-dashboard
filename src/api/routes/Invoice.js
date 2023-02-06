import express from "express";
import { authMiddleware } from "node-mongoose-auth/auth.js";

import {
  Stripe,
  handleError,
  setCustomStatus,
  notPermitted,
  toTitleCase,
  setTemporaryStatus,
} from "../stripe.js";

const router = express.Router();

router.post("/coupon-codes-all", async (req, res) => {
  try {
    const couponCodes = await Stripe.promotionCodes.list({
      limit: 100,
    });
    return res.formatter.ok(couponCodes);
  } catch (error) {
    res.formatter.serverError(error);
  }
});

router.post("/list", async (req, res) => {
  const {
    collection_method,
    created,
    due_date,
    ending_before,
    limit,
    starting_after,
    customer_email_filter,
    marked_status_filter,
    set_status_filter,
  } = req.body;

  const options = {
    collection_method,
    created,
    due_date,
    ending_before,
    limit: limit || 100,
    starting_after,
  };

  let invoices = null;
  let customerId = null;
  let isSearch =
    customer_email_filter || marked_status_filter || set_status_filter;

  console.log(`isSearch: ${isSearch}`)

  if (customer_email_filter) {
    const customerSearchResult = await Stripe.customers.search({
      query: `email:"${customer_email_filter}"`,
      limit: 1,
    });
    customerId = customerSearchResult?.data?.[0]?.id;
  }

  if (isSearch) {
    let query = `created>=${created.gte} created<=${created.lte} ${
      marked_status_filter
        ? `metadata["marked_status"]:"${marked_status_filter}"`
        : ""
    } ${
      set_status_filter
        ? `metadata["custom_status"]:"${set_status_filter}"`
        : ""
    } ${customerId ? `customer:"${customerId}"` : ""}`;
    invoices = await Stripe.invoices.search({ query });
  } else {
    invoices = await Stripe.invoices.list(options);
  }

  return res.formatter.ok(invoices);
});

router.post("/retrieve", authMiddleware, async (req, res) => {
  const data = req.body;

  const user = req.user;

  if (!data.invoice_id) return res.formatter.badRequest("Missing Invoice ID.");
  if (notPermitted(user, "general_permissions", "view_invoice"))
    return res.formatter.unauthorized(
      "You don't have the permission to view invoices."
    );

  try {
    const invoice = await Stripe.invoices.retrieve(data.invoice_id);

    return res.formatter.ok(invoice);
  } catch (err) {
    return handleError(res, err);
  }
});

router.post("/update/:action", authMiddleware, async (req, res) => {
  const data = req.body;

  const action = req.params.action;
  const invoice_id = data.invoice_id;
  const user = req.user;

  if (!action) return res.formatter.badRequest("Missing action.");
  if (!invoice_id) return res.formatter.badRequest("Missing invoice ID.");
  console.log(user.invoice_permissions["set_" + action]);
  if (notPermitted(user, "invoice_permissions", "set_" + action)) {
    let s = action;
    s = toTitleCase(action);
    s = s.replaceAll("_", " ");
    return res.formatter.unauthorized(
      `You are not authorized to change status of Invoices to ${s}.`
    );
  }

  if (
    ![
      "paid",
      "invoiced_in_error",
      "waiver",
      "voucher",
      "refund",
      "uncollectible",
    ].includes(action)
  )
    return res.formatter.badRequest("Invalid action attempted.");

  try {
    let invoice = {};
    if (action === "finalize") {
      //     invoice = await Stripe.invoices.finalizeInvoice(invoice_id);
    } else if (action === "invoiced_in_error") {
      invoice = setCustomStatus(invoice_id, "invoiced_in_error");
      invoice = await Stripe.invoices.voidInvoice(invoice_id);
      return res.formatter.ok(invoice);
    } else if (action === "paid") {
      invoice = setCustomStatus(invoice_id, "paid");
      invoice = await Stripe.invoices.pay(invoice_id);
      return res.formatter.ok(invoice);
    } else if (action === "uncollectible") {
      invoice = setCustomStatus(invoice_id, "uncollectible");
      invoice = await Stripe.invoices.markUncollectible(invoice_id);
      return res.formatter.ok(invoice);
    } else if (action === "waiver") {
      invoice = await setCustomStatus(invoice_id, "waiver");
      const waiver_amount = invoice.metadata.waiver_amount;
      if (!waiver_amount)
        return res.formatter.badRequest("Waiver amount not set");
      if (invoice.status === "open" || invoice.status === "uncollectible") {
        Stripe.invoices
          .create({
            from_invoice: {
              action: "revision",
              invoice: invoice.id,
            },
          })
          .then(async (newInvoice) => {
            const waiverCoupon = await Stripe.coupons.create({
              amount_off: waiver_amount,
              currency: newInvoice.currency,
            });
            newInvoice = await Stripe.invoices.update(newInvoice.id, {
              discounts: [
                {
                  coupon: waiverCoupon.id,
                },
              ],
            });
            invoice = await Stripe.invoices.finalizeInvoice(newInvoice.id);
            return res.formatter.ok(invoice);
          })
          .catch((error) => {
            return res.formatter.badRequest(error.message);
          });
      } else if (invoice.status === "draft") {
        const waiverCoupon = await Stripe.coupons.create({
          amount_off: waiver_amount,
          currency: invoice.currency,
        });
        invoice = await Stripe.invoices.update(invoice.id, {
          discounts: [
            {
              coupon: waiverCoupon.id,
            },
          ],
        });
        return res.formatter.ok(invoice);
      } else {
        return res.formatter.badRequest("Cannot change status of this invoice");
      }
    } else if (action === "voucher") {
      invoice = await setCustomStatus(invoice_id, "voucher");
      const voucher_id = invoice.metadata.voucher_id;
      if (!voucher_id) return res.formatter.badRequest("Voucher not set");
      const voucher = await Stripe.promotionCodes.retrieve(voucher_id);
      if (!voucher) return res.formatter.badRequest("Voucher not present");
      const coupon = await Stripe.coupons.retrieve(voucher.coupon.id);
      if (!coupon)
        return res.formatter.badRequest("Voucher coupon not present");
      if (invoice.status === "open" || invoice.status === "uncollectible") {
        Stripe.invoices
          .create({
            from_invoice: {
              action: "revision",
              invoice: invoice.id,
            },
          })
          .then(async (newInvoice) => {
            newInvoice = await Stripe.invoices.update(newInvoice.id, {
              discounts: [
                {
                  coupon: voucher.coupon.id,
                },
              ],
            });
            invoice = await Stripe.invoices.finalizeInvoice(newInvoice.id);
            return res.formatter.ok(invoice);
          })
          .catch((error) => {
            return res.formatter.badRequest(error.message);
          });
      } else if (invoice.status === "draft") {
        invoice = await Stripe.invoices.update(invoice.id, {
          discounts: [
            {
              coupon: voucher.coupon.id,
            },
          ],
        });
        return res.formatter.ok(invoice);
      } else {
        return res.formatter.badRequest("Cannot change status of this invoice");
      }
    } else if (action === "refund") {
      invoice = setCustomStatus(invoice_id, "refund");
      invoice = await Stripe.invoices.retrieve(invoice_id);
      const charge = invoice.charge;
      console.log(charge);
      const refund = await Stripe.refunds.create({ charge });
      return res.formatter.ok(invoice);
    } else {
      return res.formatter.badRequest(new Error(`Unknown action ${action}`));
    }
  } catch (err) {
    return handleError(res, err);
  }
});

router.post("/update/label/:action", authMiddleware, async (req, res) => {
  const data = req.body;

  const action = req.params.action;
  const invoice_id = data.invoice_id;
  const user = req.user;

  if (!action) return res.formatter.badRequest("Missing action.");
  if (!invoice_id) return res.formatter.badRequest("Missing invoice ID.");
  if (notPermitted(user, "invoice_permissions", "set_to_be_" + action)) {
    let s = action;
    s = toTitleCase(action);
    s = s.replaceAll("_", " ");
    return res.formatter.unauthorized(
      `You are not authorized to ch ange status of Invoices to ${toTitleCase(
        s
      )}.`
    );
  }

  if (
    ![
      "paid",
      "invoiced_in_error",
      "waiver",
      "voucher",
      "refund",
      "uncollectible",
    ].includes(action)
  )
    return res.formatter.badRequest("Invalid action attempted.");

  try {
    let invoice = null;
    if (["waiver", "voucher"].includes(action)) {
      invoice = await Stripe.invoices.update(invoice_id, {
        metadata: {
          marked_status: action,
          voucher_id: data.voucher_id,
          waiver_amount: data.waiver_amount > 0 ? data.waiver_amount : null,
        },
      });
    } else {
      invoice = await setTemporaryStatus(invoice_id, action);
    }
    return res.formatter.ok(invoice);
  } catch (err) {
    return handleError(res, err);
  }
});

export default router;
