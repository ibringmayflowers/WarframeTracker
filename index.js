require('dotenv').config();
const express = require('express');
const database = require('./database.js');
const bodyParser = require("body-parser");
const tokens = require("./utilities/tokens.js");
const cookieParser = require("cookie-parser")


const app = express();
const port = process.env.PORT;

const db = new database(process.env.DB_PATH);

app.use(express.static('public'));
app.use('/css', express.static(__dirname+'public/css'));
app.use('/js', express.static(__dirname+'public/js'));
app.use('/img', express.static(__dirname+'public/img'));


app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));

function generateWikiLink(name){
    fixed_name = name.replaceAll(" ", "_")
    return "https://warframe.fandom.com/wiki/"+name;
}

app.route("/")
    .get((req, res) =>{
        res.redirect("/login");
    })


app.route("/login")
    .get((req, res) =>{
        res.render("login.ejs", {status: req.query.login});
    })
    .post((req, res) =>{
        if(db.validateUser(req.body.username, req.body.password)){
            const token = tokens.generateToken({username: req.body.username});
            res.cookie('token', token, { httpOnly: true });
            res.redirect("/warframes");
        }else{
            res.render("login.ejs", {status: "invalidCredentials"})
        }
    });

app.route('/logout')
    .get((req, res) => {
        res.clearCookie('token');
        res.redirect("/login");
    });

app.route("/signup")
    .get((req, res) =>{
        res.render("signup.ejs", {errorMessage: ""});
    })
    .post((req, res) =>{
        if(db.addUser(req.body.username, req.body.password)){
            res.redirect("/login?login=success")
        }else{
            res.render("signup.ejs", {errorMessage: "Unable to create account: User already Exists"});
        }
    })

app.route("/warframes")
    .get(tokens.verifyToken, (req, res) =>{
        res.render("warframes.ejs", {warframes: db.getFrameOwnership(req.user.username), frameInfo: null, ownershipMessage: ""});
    })
    .post(tokens.verifyToken, (req, res) =>{
        //console.log(req.body);
        let info = db.findFrame(req.body.warframe);
        info.wikiLink = generateWikiLink(req.body.warframe);
        info.ownership = db.userOwnsItem(req.user.username, req.body.warframe);
        info.parts = db.getFramePartOwnership(req.body.warframe, req.user.username);
        //console.log(info.parts);
        //console.log(info);
        const ownershipMessage = db.userOwnsItem(req.user.username, req.body.warframe)? "I no longer own this frame" : "I now own this frame";
        res.render("warframes.ejs", {warframes: db.getFrameOwnership(req.user.username), frameInfo: info, ownershipMessage: ownershipMessage});
    });

app.route("/warframes/ownership")
    .post(tokens.verifyToken, (req, res) =>{
        if(req.body.nowOwns){
            // update so that ownership alligns with nowOwns
            db.addOwnership(req.user.username, req.body.frame);
        }else{
            // update so that ownership alligns with nowOwns
            db.removeOwnership(req.user.username, req.body.frame);
        }
        res.status(200).send();
    })

app.route("/warframes/updateFrameOwnership")
    .post(tokens.verifyToken, (req, res) =>{
        console.log(req.body);
        const parts = ["Blueprint", "Neuroptics", "Chassis", "Systems"]
        for(let i = 0; i < 4; i++){
            db.setFramePartOwnership(req.body.frameName, parts[i], req.user.username, req.body.selected.includes(parts[i]));
        }
    })

const server = app.listen(port, ()=>{
    db.getFrameNames();
    console.log("server is now running on port " + port+ "\n");
});



// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...\n');
    server.close(() => {
      console.log('Server closed. Exiting process...\n');
      process.exit(0);
    });
  });
  
  const AUTH_TOKEN = process.env.SHUTDOWN_TOKEN
  // Custom endpoint to trigger shutdown
  app.post('/shutdown', (req, res) => {
    const token = req.headers['authorization'];
  
    // Check for the correct token
    if (token === `Bearer ${AUTH_TOKEN}`) {
      res.send('Shutting down the server...\n');
      server.close(() => {
        process.exit(0);
      });
    } else {
      res.status(403).send('Forbidden: Invalid authentication token');
    }
  });
  