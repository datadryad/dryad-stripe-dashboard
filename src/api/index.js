import { default as dotenv } from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
// require('dotenv').config();
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const mongo = require('@metamodules/mongo')().base;

import invoiceRoutes from "./routes/Invoice.js";

import { responseEnhancer } from "express-response-formatter";
import mongoose from "mongoose";
import { authRouter } from "node-mongoose-auth";
import { WebSocketServer } from "ws";
import AuthRoutes from "./routes/Auth.js";
import reportRoutes from "./routes/Report.js";
import webHookRoutes from "./routes/StripeWebhook.js";
import { initiateRestore, Stripe } from "./stripe.js";
import { addActiveUserSession } from "./websocket_utils.js";

process.env.SECRET_KEY = "DEV";
// const UserSchema = require("node-mongoose-auth/models/UserSchema").add({permissions : String});

const app = express();
const port = 4000;
app.use(cors());

const MONGO_URI = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_SERVICE_HOST}:${process.env.MONGO_SERVICE_PORT}/${process.env.MONGO_INITDB_DATABASE}?authSource=admin`;
// const MONGO_URI = "mongodb+srv://admin:admin@cluster0.loydr.mongodb.net/mongo?retryWrites=true&w=majority"

console.log(MONGO_URI);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then((r) => {
  initiateRestore();
  console.log("MongoDB Connected");
  app.use("/auth", authRouter);
  app.use("/users", AuthRoutes);
});

app.use("/webhook", webHookRoutes);

app.use(responseEnhancer());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/invoices", invoiceRoutes);
app.use("/reports", reportRoutes);

// PRINT ROUTES
// function print (path, layer) {
//     if (layer.route) {
//       layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))))
//     } else if (layer.name === 'router' && layer.handle.stack) {
//       layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))))
//     } else if (layer.method) {
//       console.log('%s /%s',
//         layer.method.toUpperCase(),
//         path.concat(split(layer.regexp)).filter(Boolean).join('/'))
//     }
//   }

//   function split (thing) {
//     if (typeof thing === 'string') {
//       return thing.split('/')
//     } else if (thing.fast_slash) {
//       return ''
//     } else {
//       var match = thing.toString()
//         .replace('\\/?', '')
//         .replace('(?=\\/|$)', '$')
//         .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
//       return match
//         ? match[1].replace(/\\(.)/g, '$1').split('/')
//         : '<complex:' + thing.toString() + '>'
//     }
//   }

//   app._router.stack.forEach(print.bind(null, []))
// PRINT ROUTES

const server = app.listen(port, () => console.log(`Backend API listening on port ${port}!`));

const wss = new WebSocketServer({ noServer: true });

global.sessions_mapping = {};
wss.on("connection", async function connection(ws, request, user_id, report_id) {
  await addActiveUserSession(report_id, ws);
  const reportRun = await Stripe.reporting.reportRuns.retrieve(report_id);

  if (reportRun.status !== "pending") {
    ws.send(JSON.stringify(reportRun));
    ws.close();
  }

  ws.on("message", function message(data) {
    ws.send(data);
  });
});

server.on("upgrade", async function upgrade(request, socket, head) {
  //handling upgrade(http to websocekt) event

  //emit connection when request accepted
  wss.handleUpgrade(request, socket, head, async function done(ws) {
    try {
      const search = request.url.substring(1);
      const params = new URLSearchParams(search);

      const auth_token = params.get("auth_token");
      const report_id = params.get("report_id");

      // console.log(auth_token, report_id);

      const user_data = await jwt.verify(auth_token, process.env.SECRET_KEY);

      wss.emit("connection", ws, request, user_data.id, report_id);
    } catch (error) {
      console.log(error.message || error);
      socket.destroy();
    }
  });
});
