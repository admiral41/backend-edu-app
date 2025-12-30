const express = require("express");
const path = require("path");
const moment = require("moment");
const morgan = require("morgan");
const http = require("http");
require("dotenv").config();

const mongodb = require("./configs/mongodb");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./configs/swagger");
const session = require("express-session");
const passport = require("passport");
const createSuperAdmin = require("./utils/createSuperAdmin")
// Start app
const app = express();

// Logging
app.use(morgan("dev"));

// Request body limit
app.use(express.json({ limit: "50mb" }));
app.use(
    express.urlencoded({
        extended: false,
        limit: "50mb",
    })
);

// Static files
app.use(express.static(path.join(__dirname, "")));

// Sessions
app.use(
    session({
        resave: false,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET || "SECRET",
    })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// CORS
require("./requires/cors")(app);

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "PadhaiHub API Docs"
}));

// All routes
app.use(require("./requires/allRoutes"));

// Create server
const server = http.createServer(app);

// Connect DB, then create SUPERADMIN, then start server
mongodb().then(async () => {
    // Create SUPERADMIN after DB is ready
    await createSuperAdmin();

    server.listen(process.env.PORT, () => {
        console.log("========================================");
        console.log(
            `🚀 Server Running at http://localhost:${process.env.PORT}`
        );
        console.log("========================================");
    });
}).catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
});

module.exports = app;
