var express=require("express");
var app=express();
var bodyParser =require("body-parser");
var mongoose =require("mongoose");
var flash=require("connect-flash");
var passport =require("passport");
var LocalStrategy=require("passport-local");
var methodOverride = require("method-override");
var Ngo =require("./models/Ngo");
var User =require("./models/User");
// var authRoutes= require('./routes/auth');
var projectRoutes= require('./routes/project');
// var seedDB = require("./seed");
app.set("view engine","ejs");
// app.use(express.static(__dirname + '/public'));
app.use(express.static('public'));
// seedDB();
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/nitshacks3");
app.use(bodyParser.urlencoded({extended:false}));

app.use(require("express-session")({
	secret: "I am the best",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use('user',new LocalStrategy(User.authenticate()));
passport.use('ngo',new LocalStrategy(Ngo.authenticate()));
passport.serializeUser(function(user,done){
	var key={
		id:user.id,
		type:user.usertype
	}
	done(null,key);
});
passport.deserializeUser(function(key,done){
	  var Model = key.type === 'employee' ? User : Ngo; 
  Model.findOne({
    _id: key.id
  },function(err, user) {
    done(err, user);
  });
});


app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	// res.locals.error=req.flash("error");
	// res.locals.success=req.flash("success");
	next();
});

//routes

//home
app.get('/',function(req,res){
	console.log(req.user);
	// console.log(req.ngo);
	// console.log(req.Ngo);
	res.render('index');
});

//landing page showing ngos based on categories
app.get('/ngos/:ngoType',function(req,res){
	console.log(req.user);
	// console.log(req.ngo);
	// console.log(req.Ngo);
	var ngos=Ngo.find({type:req.params.ngoType},function(err,allngos){
		if(allngos.length===0)
			console.log("empty");
		if(err){
			console.log(err);
		}else{
			res.render('ngos_based_on_type',{ngoType:req.params.ngoType,ngos:allngos});
		}
	});
})

// app.use('/',authRoutes);
app.get('/signup',function(req,res){
	res.render('register_ngo');
});
//adding ngo to database using data from signup page
app.post('/ngos/add',function(req,res){
	ngo=new Ngo({
		username: req.body.username,
		email: req.body.email,
		type:req.body.ngoType,
		description: req.body.description,
		usertype: 'ngo'
	});
	Ngo.register(ngo,req.body.password,function(err,ngo){
		if(err){
			console.log(err);
			return res.render("index");
		}
		passport.authenticate("ngo")(req,res,function(){
			res.redirect('/ngos/health');
		});
	});
	// await ngo.save();
	// res.render('/ngos'+ngo.type+'/'+ngo._id);
});

//employee signup

app.get('/admin/signup',function(req,res){
	res.render('register_employee');
});

app.post("/admin/signup",function(req,res){
	var newUser=new User({username:req.body.username,email:req.body.email,usertype:'employee'});
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			res.redirect("/admin/signup");
		}
		passport.authenticate("user")(req,res,function(){
			res.redirect("/");
		});
	});
});

//login

app.get("/login",function(req,res){
	res.render("login");
});
app.post("/login/user",passport.authenticate("user",{
	successRedirect: "/",
	failureRedirect: "/login"
}),function(req,res){
});
app.post("/login/ngo",passport.authenticate("ngo",{
	successRedirect: "/ngos/health",
	failureRedirect: "/login"
}),function(req,res){
});
app.use('/project/',projectRoutes)
app.listen(4000,function(){
	console.log("Server has been Started");
})