// src/routes/index.js
import departmentRoutes from "./routes/department.routes.js";
import internRoutes from "./routes/intern.routes.js";
import projectRoutes from "./routes/projectRoutes.js";
import userRoutes from "./routes/user.routes.js";



const setupRoutes = (app) => {
  app.use('/user', userRoutes);
    app.use('/intern', internRoutes);
//   app.use('/hr', hrRoutes);
//   app.use('/mentor', mentorRoutes);
  app.use('/project', projectRoutes);
//   app.use('/certificate', certificateRoutes);
//   app.use('/acadmics', acadmicsRoutes);
  app.use('/department', departmentRoutes);
};

export default setupRoutes;
