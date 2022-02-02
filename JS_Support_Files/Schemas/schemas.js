'use strict';
const joi = require('joi');

exports.string = joi.array().items(
    joi.string().allow(null,'')
).required()

exports.string_number= joi.array().items(
    joi.string().allow(null,''),
    joi.number()
).required()

exports.string_array= joi.array().items(
    joi.string().allow(null,''),
    joi.array().items(joi.string().allow(null,''))
).required()

exports.string_number_array = joi.array().items(
    joi.string().allow(null,''),
    joi.number(),
    joi.array().items(joi.string().allow(null,''))
).required()

exports.object=joi.array().items(
    joi.object().required()
).required()

exports.object_string = joi.array().items(
    joi.object().required(),
    joi.string().allow(null,'')
).required()

exports.object_string_number=joi.array().items(
    joi.object().required(),
    joi.string().allow(null,''),
    joi.number()
).required()