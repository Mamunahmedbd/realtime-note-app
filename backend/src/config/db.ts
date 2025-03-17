import mongoose from 'mongoose';
import { config } from './dotenv';

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoURI);
        console.log('Connected to MongoDB');

        if (!(await mongoose.connection.db!.listCollections({ name: 'notes' }).hasNext())) {
            await mongoose.connection.db!.createCollection('notes');
            console.log('Projects collection created');
        }
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export default connectDB;
