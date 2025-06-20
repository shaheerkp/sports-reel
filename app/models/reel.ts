import mongoose from 'mongoose';

const ReelSchema = new mongoose.Schema({
  celebrityName: { type: String, required: true, unique: true },
  queries: { type: String }, 
  imageUrls: {type:Array},      
  videoUrls: { type: String },       
  audioUrls: { type: String },      
  generationCompleted: { type: Boolean,required: true,default:false},
  createdAt: { type: Date, default: Date.now },
  keyWords:{type:Array}
});

export const Reel = mongoose.models.Reel || mongoose.model('Reel', ReelSchema);
