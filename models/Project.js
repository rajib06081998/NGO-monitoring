var mongoose=require("mongoose");
var projectSchema=new mongoose.Schema({
	title: String,
	image: String,
	description:String,
	author:{
		id:{
			type:mongoose.Schema.Types.ObjectId,
			ref: "Ngo"
		},
		username:String
	},
	stage: String,
	document: String
});
module.exports=mongoose.model("Project",projectSchema);