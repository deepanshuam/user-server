import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    f_Image: { type: String }, // Store path for the image
    f_Name: { type: String, required: true },
    f_Email: { type: String, required: true, unique: true },
    f_Mobile: { type: String, required: true },
    f_Designation: { type: String, enum: ['HR', 'Manager', 'Sales'], required: true },
    f_gender: { type: String, enum: ['Male', 'Female'], required: true },
    f_Course: { type: [String], enum: ['MCA', 'BCA', 'BSC'], required: true },
    f_Createdate: { type: Date, default: Date.now }
});

export default mongoose.model('Employee', employeeSchema);
