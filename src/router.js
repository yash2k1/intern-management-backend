// src/routes/index.js
import departmentRoutes from "./routes/department.routes.js";
import internRoutes from "./routes/intern.routes.js";
import projectRoutes from "./routes/projectRoutes.js";
import userRoutes from "./routes/user.routes.js";
import hrRoutes from "./routes/hr.routes.js";
import mentorRoutes from "./routes/mentor.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";

const setupRoutes = (app) => {
  app.use("/user", userRoutes);
  app.use("/intern", internRoutes);
  app.use("/hr", hrRoutes);
  app.use("/mentor", mentorRoutes);
  app.use("/project", projectRoutes);
  app.use("/department", departmentRoutes);
    app.use('/certificate', certificateRoutes);
  //   app.use('/acadmics', acadmicsRoutes);
};

export default setupRoutes;
