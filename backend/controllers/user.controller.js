import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import AWS from "aws-sdk";

// AWS S3 configuration
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;
         
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        const file = req.file; //taking image for profile 
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exist with this email.',
                success: false,
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile:{
                profilePhoto:cloudResponse.secure_url,
            }
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        };
        // check role is correct or not
        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        };

        const tokenData = {
            userId: user._id
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            //previousHistory: user.previousHistory,
            //bestFitJobs: user.bestFitJobs,
            profile: user.profile
        }

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpsOnly: true, sameSite: 'strict' }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// export const updateProfile = async (req, res) => {
//     try {
//         const { fullname, email, phoneNumber, bio, skills } = req.body;
        
//         const file = req.file;
//         // cloudinary ayega idhar
//         const fileUri = getDataUri(file);
//         const cloudResponse = await cloudinary.uploader.upload(fileUri.content);



//         let skillsArray;
//         if(skills){
//             skillsArray = skills.split(",");
//         }
//         const userId = req.id; // middleware authentication
//         let user = await User.findById(userId);

//         if (!user) {
//             return res.status(400).json({
//                 message: "User not found.",
//                 success: false
//             })
//         }
//         // updating data
//         if(fullname) user.fullname = fullname
//         if(email) user.email = email
//         if(phoneNumber)  user.phoneNumber = phoneNumber
//         if(bio) user.profile.bio = bio
//         if(skills) user.profile.skills = skillsArray
      
//         // resume comes later here...
//         if(cloudResponse){
//             user.profile.resume = cloudResponse.secure_url // save the cloudinary url
//             user.profile.resumeOriginalName = file.originalname // Save the original file name
//         }


//         await user.save();

//         user = {
//             _id: user._id,
//             fullname: user.fullname,
//             email: user.email,
//             phoneNumber: user.phoneNumber,
//             role: user.role,
//             profile: user.profile
//         }

//         return res.status(200).json({
//             message:"Profile updated successfully.",
//             user,
//             success:true
//         })
//     } catch (error) {
//         console.log(error);
//     }
// }

// export const updateProfile = async (req, res) => {
//     try {
//         const { fullname, email, phoneNumber, bio, skills } = req.body;
        
//         const userId = req.id; // Middleware authentication
//         let user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({
//                 message: "User not found.",
//                 success: false
//             });
//         }

//         // Process file upload if `req.file` is present
//         let cloudResponse;
//         if (req.file) {
//             const fileUri = getDataUri(req.file);
//             cloudResponse = await cloudinary.uploader.upload(fileUri.content);
//         }

//         // Parse skills if provided
//         let skillsArray;
//         if (skills) {
//             skillsArray = skills.split(",");
//         }

//         // Updating user data
//         if (fullname) user.fullname = fullname;
//         if (email) user.email = email;
//         if (phoneNumber) user.phoneNumber = phoneNumber;
//         if (bio) user.profile.bio = bio;
//         if (skillsArray) user.profile.skills = skillsArray;

//         // Update resume data if file was uploaded
//         if (cloudResponse) {
//             user.profile.resume = cloudResponse.secure_url; // Save Cloudinary URL
//             user.profile.resumeOriginalName = req.file.originalname; // Save the original file name
//         }

//         await user.save();

//         // Prepare updated user data for response
//         user = {
//             _id: user._id,
//             fullname: user.fullname,
//             email: user.email,
//             phoneNumber: user.phoneNumber,
//             role: user.role,
//             profile: user.profile
//         };

//         return res.status(200).json({
//             message: "Profile updated successfully.",
//             user,
//             success: true
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             message: "An error occurred while updating the profile.",
//             success: false
//         });
//     }
// };
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;

        const userId = req.id; // Middleware authentication
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        // Process file upload if `req.file` is present
        let cloudResponse;
        let s3Response;
        if (req.file) {
            const fileUri = getDataUri(req.file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);

            const s3Params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `resumes/${req.file.originalname}`,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
              };
        
              s3Response = await s3.upload(s3Params).promise();
        }

        // Parse skills if provided
        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",").map(skill => skill.trim().toLowerCase());
            //console.log("Parsed skills array:", skillsArray);
        }

        // Updating user data
        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;
        if (skillsArray) user.profile.skills = skillsArray;

        // Update resume data if file was uploaded
        if (cloudResponse) {
            user.profile.resume = s3Response.Location; // Save Cloudinary URL
            user.profile.resumeOriginalName = req.file.originalname; // Save the original file name
        }

        // If skills are provided, check for matching jobs
        if (skillsArray) {
            const jobs = await Job.find();
            const bestFitCompanies = new Set(user.profile.bestFitJobs || []);

            for (const job of jobs) {
                const jobRequirements = job.requirements.map(req => req.toLowerCase());
                //console.log(`Checking job requirements for job ID ${job._id}:`, jobRequirements);

                // Check if `skillsArray` is a subset of `jobRequirements`
                const isSubset = skillsArray.every(skill => jobRequirements.includes(skill));
                //console.log(`Is skillsArray a subset of job requirements?`, isSubset);

                if (isSubset) {
                    if (!user.bestFitJobs.includes(job.company)) {
                        user.bestFitJobs.push(job.company);
                    }
                    //bestFitCompanies.push(job.company);  // Add the company ID as a string
                    //console.log(`Added companyId ${job.company} to bestFitCompanies`);
                }
            }

            // Update bestFitJobs with unique company IDs
            //user.profile.bestFitJobs = Array.from(bestFitCompanies);
            //console.log("Updated bestFitJobs array:", user.profile.bestFitJobs);
        }

        await user.save();

        // Prepare updated user data for response
        const updatedUser = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: updatedUser,
            success: true
        });
    } catch (error) {
        console.error("Error in updateProfile:", error);
        return res.status(500).json({
            message: "An error occurred while updating the profile.",
            success: false
        });
    }
};


