var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");
var NgoSchema = new mongoose.Schema({
	username: String,
	email: String,
	type:String,
	password: String,
	usertype:String,
	description:String,
	score:String,
	projects:[
		{
			type:mongoose.Schema.Types.ObjectId,
			ref:"Project"
		}
	]
});

NgoSchema.plugin(passportLocalMongoose);

module.exports =mongoose.model("Ngo",NgoSchema);