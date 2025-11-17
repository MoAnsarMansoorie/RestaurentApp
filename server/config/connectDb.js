import mongoose from "mongoose";

const connectDb = async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Database has connected successfully.`)
        
    } catch (error) {
        console.log(`Database has not connected successfully`, error)
    }
}

export default connectDb;