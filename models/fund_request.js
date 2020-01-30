var mongoose=require("mongoose");
var fundrequestSchema=new mongoose.Schema({
	permissionDocument:String,
	application:String,
	type:String,
	Project:{
		type:mongoose.Schema.Types.ObjectId,
		ref: "Project"
	},
	status:String
});
module.exports=mongoose.model("fundRequest",fundrequestSchema);