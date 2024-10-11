import express from 'express';
import { createEmployee, getEmployees, updateEmployee, deleteEmployee,getEmployeeById} from '../controller/employe.controller.js';
import upload from '../middleware/upload.js'; // Adjust path as needed

const router = express.Router();

// Route to create a new employee with image upload
router.post('/employees', upload.single('f_Image'), createEmployee);

// Route to update an employee by ID with image upload
router.put('/updateemployees/:id', upload.single('f_Image'), updateEmployee);

// Route to get all employees
router.get('/getemployees', getEmployees);
router.get('/idemployees/:id', getEmployeeById);

// Route to delete an employee by ID
router.delete('/deleteemployees/:id', deleteEmployee);

export default router;
