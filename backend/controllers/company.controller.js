import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const registerCompany = async (req, res) => {
  try {
      const { companyName } = req.body;

      if (!companyName) {
          return res.status(400).json({
              message: "Company name is required.",
              success: false,
          });
      }

      if (!req.id) {
          return res.status(400).json({
              message: "User ID is missing from request.",
              success: false,
          });
      }

      const company = await Company.create({
          name: companyName,
          userId: req.id, // Make sure req.id is set correctly
      });

      return res.status(201).json({
          message: "Company registered successfully.",
          company,
          success: true,
      });
  } catch (error) {
      if (error.code === 11000) {
          return res.status(400).json({
              message: `Company with name "${companyName}" already exists.`,
              success: false,
          });
      } else {
          return res.status(500).json({
              message: "Error registering company. Please try again.",
              success: false,
          });
      }
  }
};

// export const registerCompany = async (req, res) => {
//     try {
//       const { companyName } = req.body;

//       console.log('Company name:', companyName);
  
//       if (!companyName) {
//         return res.status(400).json({
//           message: "Company name is required.",
//           success: false,
//         });
//       }
  
//       const company = await Company.create({
//         name: companyName,
//         userId: req.id,
//       });

//       return res.status(201).json({
//         message: "Company registered successfully.",
//         success: true,
//       });
  
//     } catch (error) {
//       if (error.code === 11000) {
//         console.error('Duplicate company name:', companyName);
//         return res.status(400).json({
//           message: `Company with name "${companyName}" already exists.`,
//           success: false,
//         });
//       } else {
//         console.error('Error creating company:', error);
//         return res.status(500).json({
//           message: "Error registering company. Please try again.",
//           success: false,
//         });
//       }
//     }
//   };
  
export const getCompany = async (req, res) => {
    try {
        const userId = req.id; // logged in user id
        const companies = await Company.find({ userId });
        if (!companies) {
            return res.status(404).json({
                message: "Companies not found.",
                success: false
            })
        }
        return res.status(200).json({
            companies,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}
// get company by id
export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            })
        }
        return res.status(200).json({
            company,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

//by company id 
export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
 
        const file = req.file;
        // idhar cloudinary ayega
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        const logo = cloudResponse.secure_url;
    
        const updateData = { name, description, website, location, logo };

        const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            })
        }
        return res.status(200).json({
            message:"Company information updated.",
            success:true
        })

    } catch (error) {
        console.log(error);
    }
}