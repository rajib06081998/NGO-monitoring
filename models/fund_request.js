var mongoose=require("mongoose");
var fundrequestSchema=new mongoose.Schema({
	permissionDocument:String,
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
module.exports=mongoose.model("fundRequest",fundrequestSchema);