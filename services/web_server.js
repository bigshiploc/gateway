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
const static_path = path.join(__dirname, '../public')

var session = require("express-session")
var passport = require('passport')

// view engine setup

server.use(session({secret: 'bigship', resave: true, saveUninitialized: true, cookie: { maxAge: 30*1000 }}));
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
