const express=require('express');
const router=express.Router();
var passport =require("passport");
var LocalStrategy=require("passport-local");
// var methodOverride = require("method-override");
var Ngo =require("../models/Ngo");
var User =require("../models/User");
passport.use('ngo',new LocalStrategy(Ngo.authenticate()));

passport.use('user',new LocalStrategy(User.authenticate()));
passport.serializeUser(function(user,done){
	var key={
		id: user._id,
		type: user.usertype
	}
	done(null,key);
});
passport.deserializeUser(function(key,done){
	if(key.type)
	var model=
	 User.findById(id, function(err, user) {
        done(err, user);
    });
});


//signup page
router.get('/signup',function(req,res){
	res.render('register_ngo');
});
//adding ngo to database using data from signup page
router.post('/ngos/add',function(req,res){
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

router.get('/admin/signup',function(req,res){
	res.render('register_employee');
});

router.post("/admin/signup",function(req,res){
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

router.get("/login",function(req,res){
	res.render("login");
});
router.post("/login/user",passport.authenticate("user",{
	successRedirect: "/",
	failureRedirect: "/login"
}),function(req,res){
});
router.post("/login/ngo",passport.authenticate("ngo",{
	successRedirect: "/ngos/health",
	failureRedirect: "/login"
}),function(req,res){
});

module.exports=router;

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