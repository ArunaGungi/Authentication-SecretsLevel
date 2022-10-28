import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import md5 from "md5";
import bcrypt from "bcrypt";

const saltRounds = 10;

const app = express();
dotenv.config();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/usersDB",{useNewUrlParser:true});

const userSchema = new mongoose.Schema({
    email:String,
    password:String
});

//const secret = process.env.SECRET;

//userSchema.plugin(encrypt, {secret:secret, encryptedFields: ['password'] });

const User=new mongoose.model("User",userSchema);

app.get("/", (req,res) => {
    res.render("home");
})
app.get("/login", (req,res) => {
    res.render("login");
})
app.get("/register", (req,res) => {
    res.render("register");
})

app.post("/register", (req,res) => {

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new User({
            email:req.body.username,
            //password:md5(req.body.password)
            password:hash
        })
        try {
            newUser.save();
            res.render("secrets");
        }
        catch(error) {
            console.log(error);
        }
    });
})

app.post("/login", (req,res) => {
    const username = req.body.username;
    //const password = md5(req.body.password);
    const password = req.body.password;
    
    User.findOne({email:username}, (err,foundUser) => {
        if(err) {
            console.log(err);
        }
        else {
            if(foundUser) {
                bcrypt.compare(password, foundUser.password, (err, result) => {
                    if(result === true)
                        res.render("secrets");
                })
            }
            //if(result.password === password) {
                //res.render("secrets");
            //}
            else {
                res.write("Login failed");
            }
        }
    })
})
app.listen(3000, () => console.log("server is running on port 3000"));