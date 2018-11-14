const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const routes = require("./routes");

const app = express();

app.use(bodyparser.json());
mongoose.connect("mongodb://skanda25011993:cs697project@ds157223.mlab.com:57223/cs697project")

app.use(
    cors({
        origin : "http://localhost:3000",
        methods:["GET","HEAD","POST","DELETE","PUT","PATCH","OPTIONS"],
        credentials:true
    })
);

app.use(
    session({
        secret:"supersecretstring12345!",
        saveUninitialized: true,
        resave: true,
        cookie:{maxAge: 60000 * 30}
    })
);
routes(app);
app.get("/",(req,res)=>  res.json({hi:"there"})
);
// app.get("/", (req, res) => res.json("sdasdsa"));
app.listen(5000);