const mongoose = require("mongoose")

mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`,
    { useNewUrlParser: true, useUnifiedTopology: true }
).then(()=>{
    console.log("connecton with mongodb is eshtablised")
}).catch((e)=>{
    console.log(e)
})