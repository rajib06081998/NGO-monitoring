var mongoose=require("mongoose");
var projectSchema=new mongoose.Schema({
	stage:String,
	Project:{
		type:mongoose.Schema.Types.ObjectId,
		ref: "Project"
	},
	date: Date
});
module.exports=mongoose.model("Log",projectSchema);