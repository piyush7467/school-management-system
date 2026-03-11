import express from "express";
import { createRoute, deleteRoute, getAllRoutes, updateRoute } from "../controllers/busRouteController.js";
import { createBus, deleteBus, getAllBuses, updateBus } from "../controllers/busController.js";
import { assignTransport, deleteAssignment, getAllAssignments, updateAssignment } from "../controllers/transportAssignmentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes
router.post("/route/create", authMiddleware(["admin"]), createRoute);
router.get("/route/all", authMiddleware(["admin", "student", "teacher"]), getAllRoutes);
router.delete('/route/:id/delete',authMiddleware(['admin']),deleteRoute)
router.put('/route/:id/update',authMiddleware(['admin']),updateRoute)

//Buses
router.post("/bus/create", authMiddleware(["admin"]), createBus);
router.get("/bus/all", authMiddleware(["admin", "student", "teacher"]), getAllBuses);
router.delete('/bus/:id/delete',authMiddleware(['admin']),deleteBus)
router.put('/bus/:id/update',authMiddleware(['admin']),updateBus)


router.post("/assignment/create", authMiddleware(["admin"]), assignTransport);
router.get("/assignments", authMiddleware(["admin"]), getAllAssignments);
router.put('/assignment/:id/update',authMiddleware(["admin"]),updateAssignment);
router.delete('/assignment/:id/delete',authMiddleware(["admin"]),deleteAssignment);


export default router;
