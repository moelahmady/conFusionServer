const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');
const Favourites = require('../models/favourite');
const Dishes = require('../models/dishes');

const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favourites.find()
            .populate('user dishes')
            .then((favourites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourites.findOne({ "user": req.user._id })
            .then((favourites) => {
                if (favourites) {
                    for (var i = 0; i < req.body.length; i++) {
                        if (favourites.dishes.indexOf(req.body[i]._id) === -1) {
                            favourites.dishes.push(req.body[i]._id);
                        }
                    }
                    favourites.save()
                        .then((favourites) => {
                            console.log('favourites Created ', favourites);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favourites);
                        }, (err) => next(err))
                        .catch((err) => next(err));

                } else {
                    Favourites.create({ "user": req.user._id })
                        .then((favourites) => {
                            if (req.body.length > 1) {
                                for (let dish of req.body) {
                                    favourites.dishes.push(dish._id);
                                }
                            } else {
                                favourites.dishes.push(req.body._id);
                            }
                            favourites.save()
                                .then((favourites) => {
                                    console.log('favourites Created ', favourites);
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favourites);
                                }, (err) => next(err))
                                .catch((err) => next(err));
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favourites.remove({ "user": req.user._id })
            .then((favourites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourites);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


favouriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourites.findOne({ "user": req.user._id })
            .then((favourites) => {
                if (favourites) {
                    if (favourites.dishes.indexOf(req.params.dishId) === -1) {

                        favourites.dishes.push(req.params.dishId);
                        favourites.save()
                            .then((favourites) => {
                                console.log('Favourite dish added ', favourites);
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favourites);
                            }, (err) => next(err))
                            .catch((err) => next(err));

                    }
                } else {
                    Favourites.create({ "user": req.user._id, "dishes": [req.params.dishId] })
                        .then((favourites) => {
                            console.log('favourites Created ', favourites);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favourites);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));

    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favourites.findOne({ "user": req.user._id })
            .then((favourites) => {
                if (favourites != null) {
                    for (let dish of favourites.dishes) {
                        if (dish._id == req.params.dishId) {
                            favourites.dishes.remove(req.params.dishId);
                        }
                    }
                    favourites.save()
                        .then((favourites) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favourites);
                        }, (err) => next(err));
                }
                else {
                    console.log("You have no Favourites");
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourites);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = favouriteRouter;