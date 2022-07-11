const express = require('express')
require('dotenv').config();
var cors = require('cors')
// const mongo = require('@metamodules/mongo')().base;

const invoiceRoutes = require("./routes/Invoice");
const responseEnhancer = require('express-response-formatter').responseEnhancer;

process.env.SECRET_KEY = "DEV";
const { authRouter } = require("node-mongoose-auth");
var mongoose = require('mongoose');
const AuthRoutes = require('./routes/Auth');
// const UserSchema = require("node-mongoose-auth/models/UserSchema").add({permissions : String});

const app = express()
const port = 4000;
app.use(cors())

const MONGO_URI = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_SERVICE_HOST}:${process.env.MONGO_SERVICE_PORT}/${process.env.MONGO_INITDB_DATABASE}?authSource=admin`


mongoose.connect(MONGO_URI).then(r => {
  console.log('connected')
  app.use('/auth', authRouter);
});

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

app.listen(port, () => console.log(`Example backend API listening on port ${port}!`))
