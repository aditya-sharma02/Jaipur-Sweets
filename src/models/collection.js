const express = require("express")
const mongoose = require("mongoose")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")

const schema = new mongoose.Schema({
    firstname: {
        type: String,
        require: true
    },
    lastname: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    gender: {
        type: String,
        require: true
    },
    phone: {
        type: Number,
        require: true,
        unique: true
    },
    age: {
        type: Number,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    confirmpassword: {
        type: String,
        require: true
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }],
    chart: [{
        fid: {
            type: Number
        },
        name: {
            type: String
        },
        cost: {
            type: Number
        },
        quantity: {
            type: Number
        },
        price: {
            type: Number
        },
        extra: {
            type: String
        }
    }],
    history: [
        [{
            fid: {
                type: Number
            },
            name: {
                type: String
            },
            cost: {
                type: Number
            },
            quantity: {
                type: Number
            },
            price: {
                type: Number
            },
            extra: {
                type: String
            }
        }]
    ],
    tprice: {
        type: Number,
        default: 0
    }
})

schema.methods.generateAuthToken = async function () {
    try {
        const newtoken = await jwt.sign({ _id: this._id.toString() }, process.env.S_KEY)
        this.tokens = this.tokens.concat({ token: newtoken })
        await this.save()
        return newtoken
    } catch (e) {
        console.log(e)
    }
}


schema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcryptjs.hash(this.password, 10)
        // this.confirmpassword = await bcryptjs.hash(this.confirmpassword ,10)
        this.confirmpassword = undefined
    }
    next()
})

const Registeremp = new mongoose.model("Registeremp", schema)

module.exports = Registeremp