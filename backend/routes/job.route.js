import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getAdminJobs, getAllJobs, getBestFitJobs, getJobById, getPreviousHistory, postJob } from "../controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, postJob);
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);

//sujay
router.route("/get-previous-history").get(isAuthenticated, getPreviousHistory);
router.route("/get-best-fit-jobs").get(isAuthenticated, getBestFitJobs);


export default router;

