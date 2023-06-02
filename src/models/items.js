const express = require("express")
const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    fid: {
        type: Number,
        require: true,
        min: 1,
        unique: true
    },
    fname: {
        type: String,
        require: true
    },
    type: {
        type: String,
        require: true,
    },
    cost: {
        type: Number,
        min: 1,
        require:true
    },
    symbol:{
        type:String,
        default:"veg",
        enum:["veg","non veg"]
    }
})

const foitm = new mongoose.model("foitm",schema)

module.exports = foitm;