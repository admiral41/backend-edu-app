const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = new Schema(
    {
        firstname: {
            type: String,
            required: true,
        },
        lastname: {
            type: String,
            required: false,
            default: ""
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },
        contact: {
            type: String,
            required: false,
        },
        address: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: false,
        },
        userImage: {
            type: String,
            required: false,
        },
        roles: {
            type: [String],
            enum: ['LEARNER', 'LECTURER', 'ADMIN', 'SUPERADMIN'],
            default: 'LEARNER'
        },

        isSuspended: {
            type: Boolean,
            default: false,
        },
        gender: {
            type: String,
            required: false,
        },
        province: {
            type: String,
            required: false,
        },
        background: {
            type: String,
            required: false,
        },
        bio: {
            type: String,
            required: false,
        },
        documents: [
            {
                docType: String,
                docName: String,
            },
        ],
        // startTime: {
        //     type: String,
        //     required: false,
        // },
        // endTime: {
        //     type: String,
        //     required: false,
        // },
        certificateName: {
            type: String,
            required: false,
        },
        hash: { type: String },
        salt: { type: String },
        socialMediaLinks: {
            type: Object,
            required: false,
        },
        verificationCode: {
            type: Number,
            require: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        // blockedModules: [{ type: String, required: false }],
        // maritalStatus: {
        //     type: String,
        //     default: 'Unmarried',
        // },
    },
    {
        timestamps: true,
    }
);

// hide some attributes of user model while sending json response
User.methods.toJSON = function () {
    let user = this.toObject();
    delete user.updatedAt;
    delete user.__v;
    return user;
};

module.exports = mongoose.model('User', User);
