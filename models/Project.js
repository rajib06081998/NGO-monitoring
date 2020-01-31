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
	document: String,
	type: String,
	isGovt: Boolean
});
module.exports=mongoose.model("Project",projectSchema);