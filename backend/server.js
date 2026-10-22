import "dotenv/config";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 LOANFLOW Backend Server running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🛡️  Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error("Failed to start LOANFLOW server:", error.message);
    process.exit(1);
  }
};

startServer();
