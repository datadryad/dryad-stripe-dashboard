import { ConsoleSqlOutlined } from "@ant-design/icons";
import express from "express";
import stripe from "stripe";
import WebSocket, { WebSocketServer } from "ws";
import Invoice from "../mongo/Invoice.js";
import { sendNotificationToAllActiveSessions } from "../websocket_utils.js";

const endpointSecret = process.env.ENDPOINT_SECRET;

const router = express.Router();

router.post("/updates", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);

    if (event.type == "invoice.updated") {
      console.log("Updating invoice : " + event.data.object.id);
      Invoice.updateOne(
        { _id: event.data.object.id },
        event.data.object,
        {
          new: true,
        },
        (err, res) => {
          console.log(err, res);
        }
      );
    }
    if (event.type === "reporting.report_run.succeeded") {
      await sendNotificationToAllActiveSessions(event.data.object.id, event.data.object);
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }

  res.send();
});

export default router;
