import express from "express";
import ENVIRONMENT from "./config/environment.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js"
import taskRoutes from "./routes/task.routes.js"
import cors from "cors"

dotenv.config();
const app = express();

app.use(
  cors({
    origin: ENVIRONMENT.URL_FRONTEND, 
    credentials: true,
  })
);
console.log("Orígenes permitidos:", ENVIRONMENT.URL_FRONTEND);



app.use(express.json()); 
app.use("/api/auth", authRoutes);
app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes); 

const PORT = ENVIRONMENT.PORT;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
}); 



