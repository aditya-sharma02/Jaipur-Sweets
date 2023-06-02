const jwt = require("jsonwebtoken")
const Registeremp = require("../models/collection")

const auth = async (req,res,next)=>{
    try {
        const token = req.cookies.jwt
        const verifyuser = await jwt.verify(token,process.env.S_KEY)
        // console.log(verifyuser)
        const data = await Registeremp.findOne({_id:verifyuser._id})
        // console.log(data)
        req.token = token
        req.data = data
        next()
    } catch (e) {
        console.log(e)
        res.send(e)
    }
}

module.exports = auth