import mongoose from "mongoose";

const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Mongo DB connected successfully");
        
    } catch (error) {
        console.log("Error to connect Mongo DB",error);
        
    }
    
}

export default connectDB;