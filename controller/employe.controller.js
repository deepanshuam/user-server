// import Employee from '../models/employe.model.js';

// export const createEmployee = async (req, res) => {
//   const { f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course } = req.body;

//   // Check for duplicate email
//   const existingEmployee = await Employee.findOne({ f_Email });
//   if (existingEmployee) {
//     return res.status(400).json({ error: 'Email already exists' });
//   }

//   try {
//     // Create a new employee instance
//     const employee = new Employee({
//       f_Name,
//       f_Email,
//       f_Mobile,
//       f_Designation,
//       f_gender,
//       f_Course
//     });

//     console.log(employee);

//     // Save the employee instance
//     await employee.save();

//     // Return the created employee as response
//     res.status(201).json(employee);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // Get Employees (Read)
// export const getEmployees = async (req, res) => {
//   try {
//     const employees = await Employee.find();
//     res.status(200).json(employees);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // Update Employee
// export const updateEmployee = async (req, res) => {
//   const { id } = req.params;
//   const { f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course } = req.body;

//   try {
//     const updatedEmployee = await Employee.findByIdAndUpdate(id, { f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course }, { new: true });
//     if (!updatedEmployee) {
//       return res.status(404).json({ error: 'Employee not found' });
//     }
//     res.status(200).json(updatedEmployee);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // Delete Employee
// export const deleteEmployee = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const deletedEmployee = await Employee.findByIdAndDelete(id);
//     if (!deletedEmployee) {
//       return res.status(404).json({ error: 'Employee not found' });
//     }
//     res.status(200).json({ message: 'Employee deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };
import Employee from '../models/employe.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadImageFromDevice, uploadImageFromURL } from '../middleware/upload.js';
import {v2 as cloudinary }from "cloudinary"
// Create Employee
// export const createEmployee = asyncHandler(async (req, res) => {
//   try {
//     const { f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course } = req.body;

//     // Validate required fields
//     if (!f_Name || !f_Email || !f_Mobile || !f_Designation || !f_gender || !f_Course) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Check for duplicate email
//     const existingEmployee = await Employee.findOne({ f_Email });
//     if (existingEmployee) {
//       return res.status(400).json({ message: 'Email already exists' });
//     }

//     // Create a new employee instance
//     const employee = new Employee({
//       f_Name,
//       f_Email,
//       f_Mobile,
//       f_Designation,
//       f_gender,
//       f_Course
//     });

//     await employee.save();
//     res.status(201).json(new ApiResponse(201, employee, 'Employee created successfully'));
//   } catch (error) {
//     console.error(error); // Log the error
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });
export const createEmployee = asyncHandler(async (req, res) => {
  try {
    const { f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course, imageUrl } = req.body;
    console.log(req.body); // Log the request body
    console.log(req.file);
    // Validate required fields
    if (!f_Name || !f_Email || !f_Mobile || !f_Designation || !f_gender || !f_Course) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check for duplicate email
    const existingEmployee = await Employee.findOne({ f_Email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Handle image upload
    let uploadedImageUrl = '';

    if (req.file) {
      // Upload image from device using multer's file path
      console.log("he")
      const result = await uploadImageFromDevice(req.file.path);
      console.log(result)
      uploadedImageUrl = result.secure_url; // Get the secure URL from the Cloudinary response
    } else if (imageUrl) {
      // Upload image from URL provided in the request body
      const result = await uploadImageFromURL(imageUrl);
      uploadedImageUrl = result.secure_url; // Get the secure URL from the Cloudinary response
    }

    // Create a new employee instance with the uploaded image URL
    const employee = new Employee({
      f_Name,
      f_Email,
      f_Mobile,
      f_Designation,
      f_gender,
      f_Course,
      f_Image: uploadedImageUrl, // Store the Cloudinary URL
    });

    await employee.save();
    res.status(201).json(new ApiResponse(201, employee, 'Employee created successfully'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Get Employees (Read)
export const getEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find();
  res.status(200).json(new ApiResponse(200, employees, 'Employees retrieved successfully'));
});

// Update Employee
export const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course } = req.body;

  // Prepare update data
  const updateData = {
      f_Name,
      f_Email,
      f_Mobile,
      f_Designation,
      f_gender,
      f_Course,
  };

  // Handle image upload if a file is uploaded
  if (req.file) {
      try {
          const result = await cloudinary.uploader.upload(req.file.path, {
              folder: 'employee_images', // Specify your folder name
          });
          updateData.image = result.secure_url; // Save the image URL from Cloudinary
      } catch (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ message: "Error uploading image" });
      }
  } else if (req.body.imageUrl) {
      // If an image URL is provided in the request body
      updateData.image = req.body.imageUrl;
  }

  // Update the employee in the database
  const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, { new: true });

  if (!updatedEmployee) {
      throw new ApiError(404, 'Employee not found');
  }

  res.status(200).json(new ApiResponse(200, updatedEmployee, 'Employee updated successfully'))});

// Delete Employee
export const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedEmployee = await Employee.findByIdAndDelete(id);
  if (!deletedEmployee) {
    throw new ApiError(404, 'Employee not found');
  }

  res.status(200).json(new ApiResponse(200, null, 'Employee deleted successfully'));
});
export const getEmployeeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const employee = await Employee.findById(id); // Adjust this line based on your ORM/DB

  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  res.status(200).json({ payload: employee });
});
