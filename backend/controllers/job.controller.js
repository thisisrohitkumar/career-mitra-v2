import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";


// admin post krega job
// Post a job (update bestFitJobs for all users based on match)
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({ message: "Something is missing", success: false });
        }

        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(",").map(skill => skill.trim().toLowerCase()), // Normalize and trim job skills
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId
        });

        const allUsers = await User.find({ role: "student" });

        for (const user of allUsers) {
            const userSkills = user.profile.skills.map(skill => skill.trim().toLowerCase());

            // Check if job requirements are a subset of user skills
            const isMatch = job.requirements.every(reqSkill => userSkills.includes(reqSkill));

            // console.log("Job requirements:", job.requirements);
            // console.log("User skills:", userSkills);
            // console.log("Is Match:", isMatch);

            if (isMatch) {
                // Add companyId to bestFitJobs if it's not already present
                if (!user.bestFitJobs.includes(companyId)) {
                    user.bestFitJobs.push(companyId);
                }

                await user.save();
            }
        }

        return res.status(201).json({ message: "Job created and matches updated", job, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", success: false });
    }
};




//This MongoDB query uses the $or operator to search for jobs where either the title or description fields match the keyword.
//The $regex with the "i" option makes the search case-insensitive, so it will find matches regardless of the text's case.
// student k liye
// Get all jobs (update previousHistory with unique job IDs, max size 30)
export const getAllJobs = async (req, res) => {
    try {
        const userId = req.id;
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ]
        };
        const jobs = await Job.find(query).populate("company").sort({ createdAt: -1 });
        
        if (!jobs) {
            return res.status(404).json({ message: "Jobs not found.", success: false });
        }
        
        // const user = await User.findById(userId);

        // Update user's previousHistory with job IDs, no size limit
        // jobs.forEach(job => {
        //     if (!user.previousHistory.includes(job._id)) {
        //         user.previousHistory.push(job._id);
        //     }
        // });

        // await user.save();
        
        return res.status(200).json({ jobs, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", success: false });
    }
};

// Get job by ID and update user's previousHistory
export const getJobById = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate("applications");
        
        if (!job) {
            return res.status(404).json({ message: "Job not found.", success: false });
        }

        const user = await User.findById(userId);

        // Add jobId to previousHistory, no size limit
        if (!user.previousHistory.includes(jobId)) {
            user.previousHistory.push(jobId);
        }

        await user.save();

        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", success: false });
    }
};

// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path:'company',
            createdAt:-1
        });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

//sujay

// Controller to get previousHistory for a user
// export const getPreviousHistory = async (req, res) => {
//     try {
//         const userId = req.id; // Assuming user ID is extracted from token middleware
//         const user = await User.findById(userId).populate("previousHistory");

//         if (!user) {
//             return res.status(404).json({ message: "User not found", success: false });
//         }

//         return res.status(200).json({ previousHistory: user.previousHistory, success: true });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Server error", success: false });
//     }
// };

export const getPreviousHistory = async (req, res) => {
    try {
        const userId = req.id; // Assuming user ID is extracted from token middleware
        const user = await User.findById(userId).populate("previousHistory");

        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        // Get all requirements from user's previous history
        const previousHistoryRequirements = user.previousHistory.flatMap(job => job.requirements);

        // Escape special characters in each requirement term for regex matching
        const escapedRequirements = previousHistoryRequirements.map(req => req.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));

        // Find jobs where requirements are a subset of any job's requirements in previousHistory
        const jobs = await Job.find({
            requirements: { $in: escapedRequirements.map(req => new RegExp(`^${req}$`, 'i')) }
        });

        // Filter unique jobs based on job ID
        const uniqueJobs = [];
        const jobIds = new Set();

        for (const job of jobs) {
            if (!jobIds.has(job._id.toString())) {
                uniqueJobs.push(job);
                jobIds.add(job._id.toString());
            }
        }

        return res.status(200).json({matchingJobs: uniqueJobs, success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};


// Controller to get bestFitJobs for a user
export const getBestFitJobs = async (req, res) => {
    try {
        const userId = req.id; // Assuming user ID is extracted from token middleware
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        // Check if user.profile.skills is defined and is an array
        const userSkills = Array.isArray(user.profile?.skills) ? user.profile.skills.map(skill => skill.toLowerCase()) : [];

        if (userSkills.length === 0) {
            return res.status(400).json({ message: "User has no skills specified", success: false });
        }

        // Retrieve all jobs from the database
        const allJobs = await Job.find();

        // Filter jobs where job requirements are a subset of user skills
        const bestFitJobs = allJobs.filter(job => {
            // Check if job.requirements is defined and is an array
            const jobRequirements = Array.isArray(job.requirements) ? job.requirements.map(req => req.toLowerCase()) : [];
            return jobRequirements.every(req => userSkills.includes(req));
        });
        return res.status(200).json({ bestFitJobs, success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};
