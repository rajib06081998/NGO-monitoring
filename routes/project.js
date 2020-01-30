const express=require('express');
// var multer = require('multer');
const Project=require('../models/Project');
const Log=require('../models/Log')
const Ngo=require('../models/Ngo');
const permissionRequest=require('../models/permission_request');
const router=express.Router();
// var upload = multer({ dest: 'public/images/' });

// router.use(function(req,res,next){
// 	if(req.session.userId)
// 		next();
// 	else
// 		res.redirect('/accounts');
// });

router.get('/',(req,res,next)=>{
	// ngoId is the userId btw
	const ngoId= req.query.ngoId;
	Project.find({Ngo: ngoId},null,{limit: 10},(err,projects)=>{
		if(projects.length==0)
			console.log("empty");
		if(err)
			next(err);
		else{
			Ngo.findOne({_id: ngoId},(err,ngo)=>{
				if(err)
					next(err);
				else
					res.render('pages/projects.ejs',{projects,ngo});
			});
		}
	});
	
});
router.get('/add',(req,res,next)=>{
	res.render('pages/project form.ejs');
});
router.post('/add',(req,res,next)=>{
	console.log(req.user);
	const newProject={
		title: req.body.Title,
		description: req.body.Description,
		stage: "Created",
		Ngo: req.user._id
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
					res.redirect('/');
			});
		}
	});
	// res.redirect('/projects');
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
				if(logs.length==0)
					console.log("empty");
				res.render('pages/project.ejs',{project,logs});
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
	res.render('pages/apply permission form');
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
					console.log('in er');
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
						upgrade(project,"Applied for permission",(err)=>{
							if(err)
								next(err);
							else{
								console.log("lskdj slkddj")
								res.redirect('/ngos/health');
							}
						});	
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
router.get('/:reqId/approve-permission',(req,res)=>{
	res.render('pages/approve permision form');
})
router.post('/:reqId/approve-permission',(req,res,next)=>{
	//There should be a check at this point to make sure the
	// the user is the appropriate government representative

	//The Mail sending code somewhere here

	Project.findOne({_id:req.params.id},(err,project)=>{
		upgrade(project, "permission approved", (err)=>{
			if(err)
				next(err);
			else
				res.redirect('/');
		});
	});
});

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