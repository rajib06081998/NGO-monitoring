var express=require("express");
var app=express();
var bodyParser =require("body-parser");
var mongoose =require("mongoose");
var flash=require("connect-flash");
var passport =require("passport");
var LocalStrategy=require("passport-local");
var methodOverride = require("method-override");
// var Club=require("./models/club");
// var Post=require("./models/post");
// var Comment =require("./models/comment");
// var User =require("./models/user");
// var seedDB = require("./seed");
app.set("view engine","ejs");
app.use(express.static(__dirname + '/public'));

// seedDB();
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/nitshacks");
app.use(bodyParser.urlencoded({extended:true}));

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
// app.use(function(req,res,next){
// 	res.locals.currentUser=req.user;
// 	// res.locals.error=req.flash("error");
// 	// res.locals.success=req.flash("success");
// 	next();
// });

//routes

app.get('/',function(req,res){
	res.render('index');
});
app.get('/ngos/:ngoType',function(req,res){
	var ngos=Ngo.find({},function(err,allngos){
		if(err){
			console.log(err);
		}else{
			res.render('ngos_based_on_type',{ngoType:req.params.ngoType,ngos:allngos});
		}
	});
})


app.listen(4000,function(){
	console.log("Server has been Started");
})