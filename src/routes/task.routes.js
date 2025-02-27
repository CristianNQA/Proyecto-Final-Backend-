import { Router } from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import { getTasks, createTask, updateTask, deleteTask } from "../controllers/task.controller.js"; 

const taskRoutes = Router();

// Todas las rutas requieren autenticacion
taskRoutes.get("/", verifyToken, getTasks);
taskRoutes.post("/", verifyToken,  createTask);
taskRoutes.put("/:id", verifyToken,  updateTask);
taskRoutes.delete("/:id", verifyToken,  deleteTask);

export default taskRoutes;

