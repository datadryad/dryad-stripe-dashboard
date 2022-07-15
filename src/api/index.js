import express from 'express';
import path from "path";
import {fileURLToPath} from 'url';

import {default as dotenv} from 'dotenv';
dotenv.config();
// require('dotenv').config();
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// const mongo = require('@metamodules/mongo')().base;

import invoiceRoutes from "./routes/Invoice.js";

import reportRoutes from './routes/Report.js';
import webHookRoutes from './routes/StripeWebhook.js';
import { responseEnhancer } from 'express-response-formatter';

process.env.SECRET_KEY = "DEV";
import { authRouter } from 'node-mongoose-auth';
import mongoose from 'mongoose';
import AuthRoutes from './routes/Auth.js';
import { initiateRestore } from './stripe.js';
// const UserSchema = require("node-mongoose-auth/models/UserSchema").add({permissions : String});

const app = express()
const port = 3000;
app.use(cors())

const MONGO_URI = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_SERVICE_HOST}:${process.env.MONGO_SERVICE_PORT}/${process.env.MONGO_INITDB_DATABASE}?authSource=admin`
console.log(MONGO_URI);

mongoose.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}).then(r => {

  initiateRestore();
  
  app.use('/auth', authRouter);
  app.use('/reports', reportRoutes);

});

app.use('/webhook', webHookRoutes);

app.use(responseEnhancer());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/invoices', invoiceRoutes);

app.use('/user', AuthRoutes);



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


app.use(express.static(path.join(__dirname, '..', '..', 'build')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'build', 'index.html'));
});

app.listen(port, () => console.log(`Backend API listening on port ${port}!`))
