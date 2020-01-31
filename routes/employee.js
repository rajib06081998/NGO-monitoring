const express=require('express');
// var multer = require('multer');
const Project=require('../models/Project');
const Log=require('../models/Log')
const Ngo=require('../models/Ngo');
const permissionRequest=require('../models/permission_request');
const fundRequest=require('../models/fund_request');
const router=express.Router();

//employee dashboard
//permission routes
router.get("/ppr",function(req,res,next){
	if(req.user.usertype==='employee'){
		permissionRequest.find({type:req.user.type,status:'pending'},function(err,pendingpermissionRequests){
			console.log(pendingpermissionRequests);
			quiteRepetetive(err,pendingpermissionRequests,function(requests,err){
				if(err){
					console.log('me');
					next(err);
				}
				else{
					// console.log('meagain');
					const ob={
							requests,
							requestType:'ppr',
							loggedIn: req.user? true: false
						}
					res.render('pages/employee_dashboard',ob);
				}
			})
			
		});
	}else{
		res.send("Access Denied");
	}
});
router.get("/apr",function(req,res){
	if(req.user.usertype==='employee'){
		permissionRequest.find({type:req.user.type,status:'approved'},function(err,approvedpermissionRequests){
			quiteRepetetive(err,approvedpermissionRequests,function(requests,err){
				if(err)
					next(err);
				else{
					const ob={
							requests,
							requestType:'apr',
							loggedIn: req.user? true: false
						}
					res.render('pages/employee_dashboard',ob);
				}
			});
		});
	}else{
		res.send("Access Denied");
	}
});

//fund routes
router.get("/pfr",function(req,res){
	if(req.user.usertype==='employee'){
		fundRequest.find({type:req.user.type,status:'pending'},function(err,pendingfundRequests){
			quiteRepetetive(err,pendingfundRequests,function(requests,err){
				if(err)
					next(err);
				else{
					const ob={
							requests,
							requestType:'pfr',
							loggedIn: req.user? true: false
						}
					res.render('pages/employee_dashboard',ob);
				}
			})
		});
	}else{
		res.send("Access Denied");
	}
});
router.get("/afr",function(req,res){
	if(req.user.usertype==='employee'){
		fundRequest.find({type:req.user.type,status:'approved'},function(err,approvedfundRequests){
			quiteRepetetive(err,approvedfundRequests,function(requests,err){
				if(err)
					next(err);
				else{
					const ob={
							requests,
							requestType:'afr',
							loggedIn: req.user? true: false
						}
					res.render('pages/employee_dashboard',ob);
				}
			})
		});
	}else{
		res.send("Access Denied");
	}
});

router.get('/showpermissionRequest/:id',function(req,res){
	permissionRequest.findOne({_id:req.params.id},function(err,request){
		if(err){
			console.log(err);
		}else{
			Project.findOne({_id:request.Project},function(err,project){
				if(err){
					console.log(err);
				}else{
					var requestObj={
						// id:request._id,
						application:request.application,
						status: request.status,
						title:project.title,
						projectId: project._id,
						permissionDocument:request.permissionDocument,
						loggedIn: req.user? true: false
					}
					res.render("pages/permissionRequest",{request:requestObj});
				}
			});
			
		}
	});
});
router.get('/showfundRequest/:id',function(req,res){
	fundRequest.findOne({_id:req.params.id},function(err,request){
		if(err){
			console.log(err);
		}else{
			Project.findOne({_id:request.Project},function(err,project){
				if(err){
					console.log(err);
				}else{
					var requestObj={
						// id:request._id,
						application:request.application,
						status: request.status,
						title:project.title,
						projectId: project._id,
						permissionDocument:request.permissionDocument,
						loggedIn: req.user? true: false
					}
					res.render("request",{request:requestObj});
				}
			});
			
		}
	});
});

function quiteRepetetive(err,Requests,func){
	if(err)
		func(null,err);
	else{
		const requests=[];
		console.log(Requests.length);
		Requests.forEach((request)=>{
			console.log("inside req",Requests.length);
			Project.findOne({_id: request.Project},"title",function(err,project){
				if(err){
					console.log("inside err",Requests.length);
					func(null,err);
				}
				else{
					requests.push({
						_id: request._id,
						application: request.application,
						project: project.title
					});
					console.log(Requests.length);
					if(requests.length === Requests.length){

						// res.render('pages/employee_dashboard',{requests,requestType:type});
						func(requests,null);
					}
				}
			});
		});

	}
}

module.exports=router;