var mongoose=require("mongoose");
var permissionrequestSchema=new mongoose.Schema({
	application:String,
	type:String,
	Project:{
		id:{
			type:mongoose.Schema.Types.ObjectId,
			ref: "Project"
		},
		title:String
	},
	status:String
});
module.exports=mongoose.model("permissionRequest",permissionrequestSchema);