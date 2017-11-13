/**
 * Created by xiaopingfeng on 10/5/17.
 */
var PORT = require('../config').SERVERS.WEB_SERVER_PORT
const jsonServer = require('json-server')
const server = jsonServer.create()
const path = require('path')
const router = jsonServer.router(path.join(__dirname, '../db.json'))
const middlewares = jsonServer.defaults()
const express = require('express');
const static_path = path.join(__dirname, '../web/public')

var cookieParser = require('cookie-parser');
var session = require("express-session")
var bodyParser = require("body-parser");
var passport = require('passport')
 
// view engine setup
server.use(cookieParser());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: false}));
server.use(session({secret: 'bigship', resave: false, saveUninitialized: true, cookie: { maxAge: 3600000*24 }}));
server.use(passport.initialize());
server.use(passport.session());

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)
server.use(express.static(static_path))

server.use(jsonServer.bodyParser)
server.use((req, res, next) => {
    if (req.method === 'POST') {
        req.body.createdAt = Date.now()
    }
    // Continue to JSON Server router
    next()
})

require('./passport')()
require('./api')(server)

server.use(router)
server.listen(PORT, () => {
    console.log('JSON Server is running')
})
