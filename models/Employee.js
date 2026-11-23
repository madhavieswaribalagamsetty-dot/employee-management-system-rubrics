
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    phone: String,
    department: String,
    role: String,
    salary: Number,

    attendance: {
        type: String,
        default: "Present"
    },

    leaveStatus: {
        type: String,
        default: "No Leave Applied"
    },

    performance: {
        type: String,
        default: "Not Evaluated"
    },

    password: {
        type: String,
        required: true,
        select: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Employee", employeeSchema);
