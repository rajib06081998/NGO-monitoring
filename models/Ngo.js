var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");
var NgoSchema = new mongoose.Schema({
	username: String,
	email: String,
	type:String,
	password: String,
	description:String,
	projects:[
		{
			type:mongoose.Schema.Types.ObjectId,
			ref:"Project"
		}
	]
});

NgoSchema.plugin(passportLocalMongoose);

module.exports =mongoose.model("Ngo",NgoSchema);