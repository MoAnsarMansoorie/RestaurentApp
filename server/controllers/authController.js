import User from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const generateToken = (res, payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: "1d"})
    res.cookie("token", token,{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // fixed env name
        sameSite: "strict",
        maxAge: 24*60*60*1000
    });
     
    return token;
};

// new: robust body parser (tries req.body first, then reads raw stream)
const parseRequestBody = (req) => {
    return new Promise((resolve) => {
        if (req.body && Object.keys(req.body).length > 0) return resolve(req.body);

        // Attempt to read raw body if available
        let data = "";
        if (req.readable) {
            req.on("data", (chunk) => {
                data += chunk;
            });
            req.on("end", () => {
                if (!data) return resolve({});
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve({});
                }
            });
            req.on("error", () => resolve({}));
            return;
        }

        // fallback: no body and not readable
        resolve({});
    });
};

// register user
export const registerUserController = async (req, res) => {
    try {
        const body = await parseRequestBody(req);
        const {name, email, password} = body || {};
        if(!name || !email || !password){
            return res.json({
                success: false,
                message: "ALl fields are required!"
            })
        }

        const existingUser = await User.findOne({email})
        if(existingUser) {
            return res.json({
                success: false,
                message: "User already exist"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // remove password before returning
        const userSafe = user.toObject ? user.toObject() : { ...user };
        if (userSafe.password) delete userSafe.password;

        return res.json({
            success: true,
            message: "User registered successfully",
            user: userSafe,
            token: generateToken(res, {id: user._1})
        })
        
    } catch (error) {
        console.log(error.message)
        return res.json({
            success: false,
            message: "Error during registration",
            error
        })
    }
}

// login user
export const loginUserController = async (req, res) => {
    try {
        const body = await parseRequestBody(req);
        const {email, password} = body || {};
        if(!email || !password){
            return res.json({
                success: false,
                message: "ALl fields are required!"
            })
        }

        const user = await User.findOne({email})
        if(!user) {
            return res.json({
                success: false,
                message: "User does not exist"
            })
        }   

        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if(!isPasswordMatched){
            return res.json({
                success: false,
                message: "Invalid credentials"
            })
        }

        // remove password before returning
        const userSafe = user.toObject ? user.toObject() : { ...user };
        if (userSafe.password) delete userSafe.password;

        return res.json({
            success: true,
            message: "User logged in successfully", 
            user: userSafe,
            token: generateToken(res, {id: user._id, role: user.isAdmin ? "admin" : "user"})
        })

    } catch (error) {
        console.log(error.message)
        return res.json({
            success: false,
            message: "Error during login",
            error
        })
    }
}

// logout user
export const logoutUserController = (req, res) => {
    res.clearCookie("token", {  
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // fixed env name
        sameSite: "strict",
    });

    return res.json({
        success: true,
        message: "User logged out successfully"
    })
}

// admin login
export const adminLoginController = async (req, res) => {
    try {
        const body = await parseRequestBody(req);
        const {email, password} = body || {};
        if(!email || !password){
            return res.json({   
                success: false,
                message: "ALl fields are required!"
            })
        }
        if(email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD){
            return res.json({
                success: false,
                message: "Invalid admin credentials"
            })
        }

        return res.json({
            success: true,
            message: "Admin logged in successfully", 
            token: generateToken(res, {role: "admin"})
        })
    } catch (error) {
        console.log(error.message)
        return res.json({   
            success: false,
            message: "Error during admin login",
            error
        })
    }
}