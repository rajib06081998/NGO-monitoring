var mongoose=require("mongoose");
var permissionrequestSchema=new mongoose.Schema({
	application:String,
	type:String,
	Project:{
			type:mongoose.Schema.Types.ObjectId,
			ref: "Project"
	},
	score:Number,
	status:String
});
module.exports=mongoose.model("permissionRequest",permissionrequestSchema);