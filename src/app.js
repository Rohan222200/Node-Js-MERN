require("dotenv").config();
const express = require('express');
const path = require('path');
require("./db/conn");
const hbs = require('hbs');
const Register = require("./models/registers");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");


const app = express();
const port = process.env.PORT || 8000;

const static_path = path.join(__dirname,"../public");
const template_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");

app.use(express.json());
app.use(cookieParser());
// it's important to get data
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

console.log(process.env.SECRET_KEY);

app.get("/", (req,res) => {
    res.render("index");
})

app.get("/secret" , (req,res) => {
    console.log(`this is awesome cookie ${req.cookies.jwt}`);
    res.render("secret");
})

app.get("/register", (req,res) => {
    res.render("register");
})

// create a new user in our database
app.post("/register", async(req,res) => {
    try {
        
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if (password === cpassword) {
            
            const registerEmployee = new Register({
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                email : req.body.email,
                gender : req.body.gender,
                phone : req.body.phone,
                age : req.body.age,
                password : password,
                confirmpassword : cpassword
            })

            console.log("the success part"+ registerEmployee);

            const token = await registerEmployee.generateAuthToken();
            console.log("the token part"+ token);

            res.cookie("jwt" , token , {
                expires:new Date(Date.now() = 300000),
                httpOnly:true
            });
            console.log(cookie);

            const registered = await registerEmployee.save();
            console.log("the page part" + registered);

            res.status(201).render("index");

        }else {
            res.send("Passwords are not matching");
        }

    } catch (err) {
        res.status(400).send(err);
        console.log("the error part" + err);
    }
})

app.get("/login", (req,res) => {
    res.render("login");
})

// login validation check
app.post("/login", async(req,res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({email:email});

        const isMatch = await bcrypt.compare(password, useremail.password);

        const token = await useremail.generateAuthToken();
        console.log("the token part"+ token);

        res.cookie("jwt" , token , {
            expires : new Date(Date.now() + 500000),
            httponly : true
        });
        console.log(cookie);

        if (isMatch) {
            res.status(201).render("index");
        }else {
            res.send("invalid password details");
        }

    } catch (err) {
        res.status(400).send("invalid login details");
    }
})



const createToken = async() => {
    const token = await jwt.sign({_id:"60b9d08b0121882e30c36245"} , "thisistheuserregistrationthisistheuserregistration");
    console.log(token);
    const userVer = await jwt.verify(token , "thisistheuserregistrationthisistheuserregistration");
    console.log(userVer);
}

createToken();

app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
})


// securing password using bcrypt hashing algo
// const bcrypt = require("bcryptjs");

// const securePass = async (pass) => {
//     const passHash = await bcrypt.hash(pass, 10);
//     console.log(passHash);

//     const passMatch = await bcrypt.compare("123456di", passHash);
//     console.log(passMatch);
// }

// securePass("123456di");