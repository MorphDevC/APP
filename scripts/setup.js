'use strict'

var analyzers = require("@arangodb/analyzers");
const {db}=require('@arangodb');

let anals=[];
analyzers.toArray().forEach(e=>anals.push(e.name()));
if(anals.includes((db._name().concat('::segment_alpha')).toString())===false)
{
    analyzers.save("segment_alpha", "segmentation", {break: "alpha"}, []);
    console.log('Analyzer segment_alpha has been created')
}