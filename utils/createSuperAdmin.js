const User = require("../models/user.model");
const crypto = require("crypto");

function genPassword(password) {
    const salt = crypto.randomBytes(32).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    return { salt, hash };
}

async function createSuperAdmin() {
    try {
        const existingAdmin = await User.findOne({ roles: "SUPERADMIN" });

        if (existingAdmin) {
            console.log("✔ SUPERADMIN already exists.");
            return;
        }

        const defaultPassword = process.env.SUPERADMIN_PASSWORD;
        const { salt, hash } = genPassword(defaultPassword);

        const newAdmin = new User({
            firstname: process.env.SUPERADMIN_FIRSTNAME,
            lastname: process.env.SUPERADMIN_LASTNAME,
            email: process.env.SUPERADMIN_EMAIL,
            contact: process.env.SUPERADMIN_CONTACT,
            roles: ["SUPERADMIN"],
            isVerified: true,
            verificationCode: 0,
            salt,
            hash,
        });


        await newAdmin.save();
        console.log("SUPERADMIN created successfully!");
        console.log(" Login Email: admin@elearning.com");
        console.log(" Password: SuperAdmin@123");
    } catch (err) {
        console.error("Failed to create SUPERADMIN:", err.message);
    }
}

module.exports = createSuperAdmin;
