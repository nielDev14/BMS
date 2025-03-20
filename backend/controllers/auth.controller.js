import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import OTPVerification from "../models/otp.model.js";
import User from "../models/user.model.js";
import UserVerification from "../models/user.verification.model.js";
import { sendOTPVerificationEmail, sendVerificationEmail } from "../utils/emails.js";
import { setToken } from "../utils/setToken.js";
import jwt from "jsonwebtoken";
import { createLog } from "./log.controller.js";

dotenv.config();

export const signUp = async (req, res, next) => {
    try {
        const {
            firstName,
            middleName,
            lastName,
            validId,
            contactNumber,
            dateOfBirth,
            email,
            password,
            barangay,
            purok,
        } = req.body;

        // Validate required fields
        if (
            !firstName ||
            !lastName ||
            !contactNumber ||
            !dateOfBirth ||
            !email ||
            !password ||
            !barangay ||
            !purok ||
            !validId?.front?.data ||
            !validId?.back?.data ||
            !validId?.front?.filename ||
            !validId?.back?.filename ||
            !validId?.front?.contentType ||
            !validId?.back?.contentType
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields including both front and back ID!",
            });
        }

        // Validate purok format
        const purokRegex = /^Purok\s\d+$/i;
        if (!purokRegex.test(purok)) {
            return res.status(400).json({
                success: false,
                message: "Invalid purok format. Must be in format 'Purok [number]'",
            });
        }

        // Check email uniqueness
        const emailExist = await User.findOne({ email });
        if (emailExist) {
            return res.status(400).json({
                success: false,
                message: "Email already exists!",
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user with ID file
        const newUser = new User({
            firstName,
            middleName: middleName || "",
            lastName,
            validId: {
                front: {
                    filename: validId.front.filename,
                    contentType: validId.front.contentType,
                    data: validId.front.data,
                },
                back: {
                    filename: validId.back.filename,
                    contentType: validId.back.contentType,
                    data: validId.back.data,
                },
            },
            contactNumber,
            dateOfBirth: new Date(dateOfBirth),
            email,
            barangay,
            purok,
            password: hashedPassword,
        });

        // Save user and send verification
        await newUser.save().then((result) => {
            sendVerificationEmail(result, res);
            res.status(201).json({
                success: true,
                message: "User registered successfully. Please check your email for verification.",
            });
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields!",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!",
            });
        }

        // Check if user is verified and active
        if (!user.isVerified || user.isActive === false) {
            let message = "Account access denied. ";
            if (!user.isVerified) {
                message += "Your account is not yet verified. Please wait for verification.";
            }
            if (user.isActive === false) {
                message +=
                    "Your account has been deactivated. Please contact your barangay office.";
            }
            return res.status(403).json({
                success: false,
                message,
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials!",
            });
        }

        const userData = {
            _id: user._id,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            validId: user.validId,
            contactNumber: user.contactNumber,
            dateOfBirth: user.dateOfBirth,
            purok: user.purok,
            email: user.email,
            role: user.role,
            barangay: user.barangay,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                barangay: user.barangay,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Modified logging section - handle different user roles
        if (user.role !== "superAdmin") {
            const logMessage =
                user.role === "user"
                    ? `Resident ${user.firstName} ${user.lastName} from ${user.barangay} has logged in`
                    : `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} ${
                          user.firstName
                      } ${user.lastName} from ${user.barangay} has logged in`;

            await createLog(user._id, "User logged in", "User Activity", logMessage);
        }

        res.status(200).json({
            success: true,
            message: "Logged in successfully!",
            user: userData,
            token,
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        res.clearCookie("token");
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (req, res, next) => {
    const { userId, uniqueString } = req.params;

    const userVerification = await UserVerification.findOne({ userId });
    if (!userVerification) {
        return res.redirect(
            "http://localhost:5173/api/v1/auth/verifiedEmail?error=true&message=Email%20verified%20or%20link%20expired"
        );
    }

    const isMatch = bcrypt.compare(uniqueString, userVerification.uniqueString);
    if (!isMatch) {
        return res.redirect(
            "http://localhost:5173/api/v1/auth/verifiedEmail?error=true&message=Link%20expired.%20Please%20resend%20a%20new%20verification."
        );
    }

    const user = await User.findById(userId);
    user.isVerified = true;
    await user.save();
    await userVerification.deleteOne();
    res.redirect("http://localhost:5000/api/auth/verifiedEmail");
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const verifiedEmail = (req, res) => {
    res.sendFile(path.join(__dirname, "../views/verified.html"));
};

export const sendOTP = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Please provide an email address!",
        });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Email not found!",
        });
    }

    try {
        await OTPVerification.deleteOne({ userId: user._id });

        const newOTP = new OTPVerification({
            userId: user._id,
            otp: Math.floor(100000 + Math.random() * 900000),
            createdAt: new Date(),
            expiresAt: new Date(new Date().getTime() + 5 * 60000),
        });

        const token = setToken(res, user._id);

        await newOTP.save().then((result) => {
            sendOTPVerificationEmail(user, result.otp, res, token);
        });
    } catch (error) {
        next(error);
    }
};

export const verifyOTP = async (req, res, next) => {
    const { email, otp } = req.body;

    if (!otp) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const otpVerification = await OTPVerification.findOne({ userId: user._id });

    if (!otpVerification) {
        return res.status(402).json({ message: "OTP has been used or expired" });
    }

    if (otpVerification.otp !== otp) {
        return res.status(401).json({ message: "Invalid OTP" });
    }

    if (otpVerification.expiresAt < new Date()) {
        await OTPVerification.deleteOne({ userId: user._id });
        return res.status(405).json({ message: "OTP is expired. Request another OTP to proceed" });
    }

    // Delete the OTP after it has been verified
    await OTPVerification.deleteOne({ userId: user._id });

    res.status(200).json({ message: "OTP verified successfully" });
};

export const resetPassword = async (req, res, next) => {
    const { email, password } = req.body;

    if (!password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;

    try {
        await user.save();
        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        next(error);
    }
};

export const verifyToken = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error verifying token",
        });
    }
};
