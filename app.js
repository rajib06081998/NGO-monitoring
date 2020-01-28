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
var permissionRequest =require("./models/permission_request");
var fundRequest =require("./models/fund_request");
var projectRoutes= require('./routes/project');
// var seedDB = require("./seed");
app.set("view engine","ejs");
app.use(express.static(__dirname + '/public'));

// seedDB();
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/nitshacks3");
app.use(bodyParser.urlencoded({extended:true}));

//Passpot config
app.use(require("express-session")({
	secret:"I am the best",
	resave:false,
	saveUninitialized:false
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
	res.render('index');
});

//landing page showing ngos based on categories
app.get('/ngos/:ngoType',function(req,res){
	console.log(req.user);
	var ngos=Ngo.find({type:req.params.ngoType},function(err,allngos){
		if(err){
			console.log(err);
		}else{
			res.render('ngos_based_on_type',{ngoType:req.params.ngoType,ngos:allngos});
		}
	});
})

//signup page
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
			res.redirect('/');
		});
	});
	// await ngo.save();
	// res.render('/ngos'+ngo.type+'/'+ngo._id);
});

//employee signup

app.get('/employee/signup',function(req,res){
	res.render('register_employee');
});

app.post("/employee/signup",function(req,res){
	var newUser=new User({username:req.body.username,email:req.body.email,usertype:'employee',type:req.body.type});
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			res.redirect("/employee/signup");
		}
		passport.authenticate("user")(req,res,function(){
			res.redirect("/");
		});
	});
});

//login

//user login
app.get("/login/user",function(req,res){
	res.render("login_user");
});

app.post("/login/user",passport.authenticate("user",{
	successRedirect: "/",
	failureRedirect: "/login/user"
}),function(req,res){
});

//ngo login
app.get("/login/ngo",function(req,res){
	res.render("login_ngo");
});

app.post("/login/ngo",passport.authenticate("ngo",{
	successRedirect: "/ngos/health",
	failureRedirect: "/login/ngo"
}),function(req,res){
});

//employee dashboard
//permission routes
app.get("/employee/ppr",function(req,res){
	if(req.user.usertype==='employee'){
		permissionRequest.find({type:req.user.type,status:'pending'},function(err,pendingpermissionRequests){
			res.render('employee_dashboard',{pendingpermissionRequests:pendingpermissionRequests});
		});
	}else{
		res.send("Access Denied");
	}
});
app.get("/employee/apr",function(req,res){
	if(req.user.usertype==='employee'){
		permissionRequest.find({type:req.user.type,status:'approved'},function(err,approvedfundRequests){
			res.render('employee_dashboard',{});
		});
	}else{
		res.send("Access Denied");
	}
});

//fund routes
app.get("/employee/pfr",function(req,res){
	if(req.user.usertype==='employee'){
		fundRequest.find({type:req.user.type,status:'pending'},function(err,pendingfundRequests){
			res.render('employee_dashboard',{});
		});
	}else{
		res.send("Access Denied");
	}
});
app.get("/employee/afr",function(req,res){
	if(req.user.usertype==='employee'){
		fundRequest.find({type:req.user.type,status:'approved'},function(err,approvedfundRequests){
			res.render('employee_dashboard',{});
		});
	}else{
		res.send("Access Denied");
	}
});

app.use('/project/',projectRoutes);

app.get("/logout",function(req,res){
	req.logout();
	// req.flash("success","Logged you Out");
	res.redirect("/");
});
app.listen(4000,function(){
	console.log("Server has been Started");
})