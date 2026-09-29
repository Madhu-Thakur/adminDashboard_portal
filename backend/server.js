const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const express = require("express");
const cookieParser = require("cookie-parser");


const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const customerRoutes = require("./routes/customerRoutes");
const addressRoutes = require("./routes/addressRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const voucherRoutes = require("./routes/voucherRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const roleRoutes = require("./routes/roleRoutes");
const joiningCandidateRoutes = require("./routes/joiningCandidateRoutes");
const designationRoutes = require("./routes/designationRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const reportRoutes = require("./routes/reportRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const taskRoutes = require("./routes/taskRoutes");
const profileRoutes = require("./routes/profileRoutes");
const managerRoutes = require("./routes/managerRoutes");
const meetRoutes = require("./routes/meetRoutes");
const todayLeaveRoutes = require("./routes/todayLeaveRoutes");
const birthdayRoutes = require("./routes/birthdayRoutes");
// const joiningRoutes = require("./routes/joiningRoutes");
const policyRoutes = require("./routes/policyRoutes");

const indentRoutes = require("./routes/indentRoutes");


const app = express();

app.use(cors());
app.use(express.json());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use("/api", employeeRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/roles", roleRoutes);
// app.use("/api/joining-candidates", joiningCandidateRoutes);
app.use("/api", joiningCandidateRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));



app.use("/api", authRoutes);
app.use("/api", profileRoutes);
app.use("/api", attendanceRoutes);
app.use("/api", reportRoutes);
app.use("/api", leaveRoutes);
app.use("/api", taskRoutes);
app.use("/api", meetRoutes);
app.use("/api", managerRoutes);
app.use("/api", todayLeaveRoutes);
app.use("/api", birthdayRoutes);
// app.use("/api", joiningRoutes);
app.use("/api", policyRoutes);
app.use("/api", indentRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "DEEM Backend is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;