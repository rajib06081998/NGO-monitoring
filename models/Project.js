var mongoose=require("mongoose");
var projectSchema=new mongoose.Schema({
	title: String,
	image: String,
	description:String,
	Ngo:{
			type:mongoose.Schema.Types.ObjectId,
			ref: "Ngo"
	},
	stage: String,
	permissionDocument: String,
	type: String,
	isGovt: Boolean,
	files:[String]
});
module.exports=mongoose.model("Project",projectSchema);