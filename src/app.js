require("dotenv").config()
const cookieParser = require("cookie-parser")
const express = require("express")
const app = express()
const port = process.env.PORT || 3000
const path = require("path")
const hbs = require("hbs")
const bcryptjs = require("bcryptjs")
const auth = require("./middleware/auth")

// collections used are import here
const Registeremp = require("./models/collection")
const foitm = require("./models/items")

// connection with mongoose
require("./db/conn")

// paths 
const spath = path.join(__dirname, "../public")
const vpath = path.join(__dirname, "templates/views")
const rpath = path.join(__dirname, "templates/partials")

// using static page 
app.use(express.static(spath))

// rgistering the partials
hbs.registerPartials(rpath)

// seting views engine 
app.set("view engine", "hbs")
app.set("views", vpath)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.get("/", (req, res) => {
    res.render("index")
})
app.get("/login", (req, res) => {
    res.render("login")
})
app.get("/afterlogin", auth, (req, res) => {
    res.render("afterlogin")
})
app.get("/logout", auth, async (req, res) => {
    try {
        // to log out user from corssponding devices =  delete that token 
        // req.data.tokens = req.data.tokens.filter((celem)=>{
        //     return celem.token!=req.token
        // })

        // to logout user from all device = delete all token
        req.data.tokens = []
        res.clearCookie("jwt")
        // humne agar kuch bhi changes kiye hai data mai to use save bhi karana hoga just like generating the token
        await req.data.save();
        res.render("login")

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})
app.get("/register", (req, res) => {
    res.render("register")
})

app.get("/fooditem", auth, async (req, res) => {
    try {
        const data = await foitm.find()
        // console.log(data)
        res.render("menu", { data: data })

    } catch (e) {
        console.log(e);
        res.send(e);
    }
})

app.get("/addtochart", auth, async (req, res) => {
    try {
        const fodata = await foitm.findOne({ fid: req.query.id });
        res.render("addtochart", { data: fodata })
    } catch (e) {
        console.log(e);
        res.send(e);
    }
})

app.post("/addtochart", auth, async (req, res) => {
    try {
        req.data.chart = req.data.chart.concat({
            fid: req.body.fid,
            quantity: req.body.quantity,
            cost: req.body.cost,
            price: req.body.quantity * req.body.cost,
            extra: req.body.extra,
            name: req.body.fname
        })
        req.data.tprice = req.data.tprice + req.body.quantity * req.body.cost;
        await req.data.save()
        const fodata = await foitm.find()
        res.render("menu", { data: fodata })
    } catch (e) {
        console.log(e);
        res.send(e);
    }
})

app.get("/final", auth, async (req, res) => {
    try {
        res.render("final", { data: req.data, tprice: req.data.tprice })
    } catch (e) {
        console.log(e);
        res.send(e);
    }
})

app.get("/deletethisitem", auth, async (req, res) => {
    try {
        req.data.chart = req.data.chart.filter((val) => {
            if (val._id == req.query.id) {
                req.data.tprice = req.data.tprice - val.price
            }
            return val._id != req.query.id
        });

        await req.data.save()
        const fodata = await foitm.find()
        res.render("menu", { data: fodata })

    } catch (e) {
        console.log(e)
        res.send(e)
    }
})

app.get("/deliveryandsavetohistory", auth, async (req, res) => {
    try {
        if (req.data.chart.length) {
            req.data.history = req.data.history.concat([req.data.chart]);
            req.data.chart = [];
            req.data.tprice = 0;
        }
        await req.data.save()
        res.render("deliverypage", { data: req.data.history })
    } catch (e) {
        console.log(e)
        res.send(e)
    }
})

app.get("/delivered", auth, async (req, res) => {
    try {
        req.data.history = [];
        await req.data.save();
        res.render("index");

    } catch (e) {
        console.log(e);
        res.send(e);
    }
})

app.post("/register", async (req, res) => {
    try {
        const password = req.body.password
        const cpassword = req.body.confirmpassword
        if (password === cpassword) {
            const newobj = new Registeremp({
                firstname: req.body.fname,
                lastname: req.body.lname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword,
            })
            // generating the token
            const token = await newobj.generateAuthToken()

            //  cookie 
            res.cookie("jwt", token, {
                // expires:new Date(Date.now()+50000),
                httpOnly: true
            })
            // console.log(cookie)

            const data = await newobj.save()
            res.render("login")
        }
        else {
            res.send("errors")
        }
    } catch (e) {
        res.status(400).send(e)
    }
})

app.post("/login", async (req, res) => {
    try {
        const data = await Registeremp.findOne({ email: req.body.email })
        const ismatch = await bcryptjs.compare(req.body.password, data.password)

        const token = await data.generateAuthToken()

        // storing cookie 
        res.cookie("jwt", token, {
            // expires:new Date(Date.now()+30000),
            httpOnly: true
        })

        if (ismatch) {
            res.render("afterlogin")
        }
        else {
            res.send("invalid credentials and")
        }


    } catch (e) {
        res.status(400).send("invalid credentials and")
    }
})



app.listen(port, () => {
    console.log(`listen to the server ${port}`)
})