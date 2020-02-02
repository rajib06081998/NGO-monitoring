const express=require('express');
// var multer = require('multer');
const Project=require('../models/Project');
const Log=require('../models/Log')
const Ngo=require('../models/Ngo');
const permissionRequest=require('../models/permission_request');
const fundRequest= require('../models/fund_request');
const router=express.Router();
// var upload = multer({ dest: 'public/images/' });

// router.use(function(req,res,next){
// 	if(req.session.userId)
// 		next();
// 	else
// 		res.redirect('/accounts');
// });
const multer = require("multer");
const ejs=require('ejs');
const path=require('path');



//set storage engine 1
const storage=multer.diskStorage({
	destination: 'public/uploads/project',
	filename: function(req,file,cb){
		cb(null,file.fieldname + '_' + Date.now() + path.extname(file.originalname));
	}
});

//2
const upload = multer({
	storage: storage
//   dest: "/uploads/project"
//   // you might also want to set some limits: https://github.com/expressjs/multer#limits
 }).single('myFile');


router.get('/',(req,res,next)=>{
	// ngoId is the userId btw
	const ngoId= req.query.ngoId;
	Project.count({Ngo: ngoId},(err,count)=>{
		if(err)
			next(err);
		else{
			Project.find({Ngo: ngoId},null,{limit: 10,skip:((req.query.pageno-1)*10)},(err,projects)=>{
				if(projects.length==0)
					console.log("empty");
				if(err)
					next(err);
				else{
					Ngo.findOne({_id: ngoId},(err,ngo)=>{
						if(err)
							next(err);
						else{
							const ob={
								ngo,
								projects,
								loggedIn: false,
								owner: false,
								count:Math.ceil(count/10),
								pageno:req.query.pageno
							}
							console.log(ob.count);
							if(req.user){
								ob.loggedIn=true;
								ob.owner=(req.user._id.toString()==ngo._id.toString())? true: false;
							}
							// console.log(ob.owner);
							res.render('pages/projects.ejs',ob);
						}
					});
				}
			});
		}

	})
	
});
router.get('/add',(req,res,next)=>{
	res.render('pages/project form.ejs',{loggedIn: req.user? true: false});
});
router.post('/add',(req,res,next)=>{
	upload(req,res,(err)=>{
		if(err)
			next(err);
		else{
			console.log(req.user);
			const newProject={
				title: req.body.Title,
				description: req.body.Description,
				stage: "Created",
				image: req.file.filename,
				Ngo: req.user._id,
				type: req.user.type,
				isGovt: false
			};
			Project.create(newProject,(err,project)=>{
				if(err)
					next(err);
				else{
					console.log(project);
					const newLog= {
						Project:project._id,
						stage: "Created",
						date: Date.now()
					};
					Log.create(newLog,(err,log)=>{
						if(err)
						 	next(err);
						else
							res.redirect('/project/'+project._id);
					});
				}
			});
		}
	})
	
	// res.redirect('/projects');
});
router.get('/gov',(req,res,next)=>{
	// ngoId is the userId btw
	let ob,obj;
	if(req.user){
		 ob= (req.user.usertype==='employee')? {isGovt: true,type: req.user.type}: {isGovt: true};
	}else{
		 ob={isGovt: true};
	}
	Project.find(ob,null,{limit: 10,skip:(req.query.pageno-1)*10},(err,projects)=>{
		if(projects.length==0)
			console.log("empty");
		if(err)
			next(err);
		else{
			 obj={
				projects,
				loggedIn: req.user? true: false,
				employee:false
			}
			if(req.user){
				obj.employee=(req.user.usertype==='employee')? true: false;
			}
		}
		Project.count(ob,(err,count)=>{
						if(err)
							next(err);
						else{
							obj.count=Math.ceil(count/10);
							obj.pageno=req.query.pageno;
							res.render('pages/govt projects.ejs',obj);						}
					})
			
	});
});
	

router.get('/:id',(req,res,next)=>{
	Project.findOne({_id:req.params.id},(err,project)=>{
		if(err) next(err);
		else{
			// let permission= false;
			// if(project.stage==="Created"){
			// 	permission
			// }
			Log.find({Project: project._id},"stage date",(err,logs)=>{
				if(err)
					next(err);
				else{
					if(project.isGovt && project.Ngo== null){
						Ngo.find({type: project.type},"username",{sort:{score:-1}},(err,ngos)=>{
							if(err)
								next(err);
							else{
								const ob={project,
								  		  logs,
								  		  ngos,
								  		  loggedIn: req.user? true: false,
								  		  stage: '',
								  		  owner:false
										}
								res.render('pages/project.ejs',ob);
							}
						})
					}
					else{
						const ob={
							project,
							logs,
							loggedIn: req.user?true: false,
							stage:project.stage,
							owner:false
						}
						if(req.user){
							ob.owner=(req.user._id.toString()==project.Ngo.toString())? true: false;
						}
						res.render('pages/project.ejs',ob);
					}
				}
				
			});
		}
	})
});
//not completed because we need to make it clear whether we want them to 
//be able to edit the project or not
router.get('/:id/edit',(req,res,next)=>{
	// res.render('pages/edit project.ejs')
	res.redirect('/');
});
router.post('/:id/edit',(req,res,next)=>{
	res.redirect('/');
});
router.get('/:id/apply-for-permission',(req,res)=>{
	res.render('pages/apply permission form',{loggedIn: req.user? true: false,request: "permission"});
})
router.post('/:id/apply-for-permission',(req,res,next)=>{
	const ob={  _id: req.params.id,
				Ngo: req.user._id
			 };
	Project.findOne(ob,(err,project)=>{
		if(err){
			console.log("in err");
			next(err);
		}
		else if(project==null)
			res.send("no such project/ you don't have the permission");
		else if(project.stage==="Created"){
			Ngo.findOne({_id: project.Ngo}, "type", (err,ngo)=>{
				if(err){
					// console.log('in er');
					next(err);
				}
				else{
					const permRequest={
						application: req.body.application,
						status: 'pending',
						type: ngo.type,
						Project: project._id
					}
					console.log(permRequest);
					permissionRequest.create(permRequest,(err,permRequest)=>{
						if(err)
							next(err)
						else{
							upgrade(project,"Applied for permission",(err)=>{
								if(err)
									next(err);
								else{
									// console.log("lskdj slkddj")
									res.redirect('/project/'+project._id);
								}
							});	
						}
					})
					// project.permApplication=req.body.application;
				}
			})
		}
		else{
			console.log("not created")
			res.redirect('/');
		}
	});
});


router.get('/:id/apply-for-fund',(req,res)=>{
	res.render('pages/apply permission form',{loggedIn: req.user? true: false, request: "fund"});
})
router.post('/:id/apply-for-fund',(req,res,next)=>{
	const ob={  _id: req.params.id,
				Ngo: req.user._id
			 };
	Project.findOne(ob,(err,project)=>{
		if(err){
			console.log("in err");
			next(err);
		}
		else if(project==null)
			res.send("no such project/ you don't have the permission");
		else if(project.stage==="permission approved"){
			Ngo.findOne({_id: project.Ngo}, "type", (err,ngo)=>{
				if(err){
					// console.log('in er');
					next(err);
				}
				else{
					const fRequest={
						application: req.body.application,
						status: 'pending',
						type: ngo.type,
						Project: project._id
					}
					console.log(fRequest);
					fundRequest.create(fRequest,(err,fRequest)=>{
						if(err)
							next(err)
						else{
							upgrade(project,"Applied for fund",(err)=>{
								if(err)
									next(err);
								else{
									// console.log("lskdj slkddj")
									res.redirect('/project/'+project._id);
								}
							});	
						}
					})
					// project.permApplication=req.body.application;
				}
			})
		}
		else{
			console.log("not created")
			res.redirect('/');
		}
	});
});


router.get('/add/gov',(req,res,next)=>{
	res.render('pages/govt project form.ejs',{loggedIn: req.user? true: false});
});

router.post('/add/gov',(req,res,next)=>{

	upload(req,res,(err) =>{
		if(err){
			console.log(err);
		}
		else
		{
			console.log(req.file);
				console.log(req.user);
				const newProject={
					title: req.body.Title,
					description: req.body.Description,
					stage: "Created",
					image: req.file.filename,
					type: req.user.type,
					isGovt: true
				};


				Project.create(newProject,(err,project)=>{
					if(err)
						next(err);
					else{
						console.log(project);
						const newLog= {
							Project:project._id,
							stage: "Created",
							date: Date.now()
						};
						Log.create(newLog,(err,log)=>{
							if(err)
							 	next(err);
							else
								res.redirect('/project/gov');
						});
					}
				});

		}
	});

});



router.post('/assignNgo/:projectId',(req,res,next)=>{
	Project.findOne({_id: req.params.projectId},(err,project)=>{
		if(err)
			next(err);
		else{
			Ngo.findOne({username: req.body.Ngo},(err,ngo)=>{
				if(err)
					next(err);
				else{
					project.Ngo= ngo._id;
					project.save((err)=>{
						if(err)
							next(err);
						else{
							res.redirect('/project?ngoId='+ngo._id);
						}
					})
				}
			})
		}
	})
})

router.get('/proof/:id',(req,res,next)=>{
	Project.findOne({_id:req.params.id},(err,project)=>{
				if(err) next(err);
				else
					{
						 //project.files.push(req.file.filename);
						// console.log(req.files);
						 //project.save((err)=>{
						 	//if(err)
						 		//next(err);
						 //});
						 res.render("pages/proof.ejs",{loggedIn: req.user? true: false,project});
						//console.log(project);
					}

			})
	
});



router.post('/proof/:id',(req,res,next)=>{
	console.log("hi");
	upload(req,res,(err)=>{
		if(err)
			next(err);
		else
		{
			Project.findOne({_id:req.params.id},(err,project)=>{
				if(err) next(err);
				else
					{
						 project.files.push(req.file.filename);
						// console.log(req.files);
						 project.save((err)=>{
						 	if(err)
						 		next(err);
						 });
						 res.redirect("/project/proof/"+project._id);
						console.log(project);
					}

			})
		}
	})
})

router.post('/final-submission/:id',(req,res,next)=>{
	Project.findOne({_id:req.params.id},(err,project)=>{
		if(err)
			next(err);
		else{
			if(project.files.length>0){

				upgrade(project,'completed',(err)=>{
					if(err)
						next(err);
					else{
						Ngo.findOne({_id:project.Ngo},(err,ngo)=>{
							ngo.score+=1;
							ngo.save((err)=>{
								res.redirect('/project/'+project._id);
							})
						})
					}
				})
			}
			else{
				res.redirect('/project/proof/'+project._id);
			}
		}
	})
})


function upgrade(project,stage,func){
	project.stage=stage;
	project.save((err)=>{
		if(err)
			func(err);
		else{
			const newLog= {
				Project:project._id,
				stage: stage,
				date: Date.now()
			};
			Log.create(newLog,(err,log)=>{
				if(err) 
					func(err);
				else
					func(null);
			});
		}
	})
}
module.exports=router;

