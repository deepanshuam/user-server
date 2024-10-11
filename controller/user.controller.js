import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

// Generate Access and Refresh Tokens
// const generateAccessAndRefreshTokens = (userId) => {
//   const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
//     expiresIn: "1d",
//   });

//   const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
//     expiresIn: "10d",
//   });

//   return { accessToken, refreshToken };
// };
const generateAccessAndRefreshTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d',
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '10d',
  });

  return { accessToken, refreshToken };
};


// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { f_userName, f_Email, f_Mobile, f_Pwd } = req.body;
  console.log(req.body);

  // Check if all required fields are present
  if (!f_userName || !f_Email || !f_Mobile || !f_Pwd) {
    console.log("Missing fields:", { f_userName, f_Email, f_Mobile, f_Pwd });
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ f_userName: f_userName.toLowerCase() }, { f_Email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Create new user
  const newUser = await User.create({
    f_userName: f_userName.toLowerCase(),
    f_Email,
    f_Mobile,
    f_Pwd,
  });

  const createdUser = await User.findById(newUser._id).select("-f_Pwd");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Return success response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// User Login
const loginUser = asyncHandler(async (req, res) => {
  const { f_Email, f_Pwd } = req.body;
  console.log(req.body);

  // Check if username and password are provided
  if (!f_Email || !f_Pwd) {
    throw new ApiError(400, "email and password are required");
  }

  // Find user by username
  //   const user = await User.findOne({ f_Email });
  // console.log(user);
  //   if (!user || user.f_Pwd !== f_Pwd) {
  //     throw new ApiError(401, "Invalid email or password");
  //   }

  const user = await User.findOne({
    $or: [{ f_Email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(f_Pwd);

  if (!isPasswordValid) {
    throw new ApiError(401, "not match");
  }

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
    user._id
  );

  // Return response with tokens
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {    user: {
          _id: user._id,
          f_userName: user.f_userName,
          f_Email: user.f_Email,
          f_Mobile: user.f_Mobile,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

// User Logout
const logoutUser = asyncHandler(async (req, res) => {
  // Clear cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-f_Pwd");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

// Forgot password logic can be implemented later

export { registerUser, loginUser, logoutUser, getCurrentUser };
