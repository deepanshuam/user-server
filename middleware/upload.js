import { v2 as cloudinary } from 'cloudinary'; // Import the Cloudinary v2 API
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload image from device
export const uploadImageFromDevice = async (filePath, folder = 'employee_images') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      allowed_formats: ['jpg', 'png', 'jpeg'],
    });
    return result;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};

// Function to upload image from URL
export const uploadImageFromURL = async (imageURL, folder = 'employee_images') => {
  try {
    const result = await cloudinary.uploader.upload(imageURL, {
      folder: folder,
      allowed_formats: ['jpg', 'png', 'jpeg'],
    });
    return result;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};

// Set up Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'employee_images', // Specify the folder name
  allowedFormats: ['jpg', 'png', 'jpeg'], // Allowed formats
});

// Create multer instance
const upload = multer({ storage });

export default upload;
