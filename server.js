require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("./middleware/authMiddleware");
const path = require("path");

const Employee = require("./models/Employee");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
let isConnected = false;

async function connectDB() {
    if (isConnected) return;

    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;

    console.log("MongoDB Connected Successfully!");
}

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

// Format employee data for the frontend
function formatEmployee(employee) {
    const data = employee.toObject();

    data.id = data._id.toString();
    delete data._id;
    delete data.__v;
    delete data.password;

    return data;
}

// GET ALL EMPLOYEES
app.get("/api/employees", verifyToken, async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees.map(formatEmployee));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADD EMPLOYEE
// JWT LOGIN
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const employee = await Employee
            .findOne({ email })
            .select("+password");

        if (!employee) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            employee.password
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: employee._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token: token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
app.post("/api/employees", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(
            req.body.password || "1234",
            10
        );

        const employee = await Employee.create({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            department: req.body.department,
            role: req.body.role,
            salary: req.body.salary,
            attendance: "Present",
            leaveStatus: "No Leave Applied",
            performance: "Not Evaluated",
            password: hashedPassword
        });

        res.json({
            message: "Employee added successfully",
            employee: formatEmployee(employee)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE EMPLOYEE
app.put("/api/employees/:id", async (req, res) => {
    try {
        const updates = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            department: req.body.department,
            role: req.body.role,
            salary: req.body.salary
        };

        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined) delete updates[key];
        });

        if (req.body.password) {
            updates.password = await bcrypt.hash(
                req.body.password, 10
            );
        }

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.json({
            message: "Employee updated successfully",
            employee: formatEmployee(employee)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE EMPLOYEE
app.delete("/api/employees/:id", async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.json({ message: "Employee deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// APPLY LEAVE
app.put("/api/employees/:id/leave", async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            { leaveStatus: req.body.status },
            { new: true }
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.json({ message: "Leave status updated" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE ATTENDANCE
app.put("/api/employees/:id/attendance", async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            { attendance: req.body.attendance },
            { new: true }
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.json({ message: "Attendance updated" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE PERFORMANCE
app.put("/api/employees/:id/performance", async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            { performance: req.body.performance },
            { new: true }
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.json({ message: "Performance updated" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// THIRD-PARTY API - INDIAN PUBLIC HOLIDAYS
app.get("/api/holidays", async (req, res) => {
    try {
        const year = new Date().getFullYear();

        const response = await fetch(
            `https://api.dharun.dev/v1/holidays/${year}?type=central_gazetted&state=AP`
        );

        const result = await response.json();

        if (!response.ok) {
            return res.status(500).json({
                message: "Holiday API request failed"
            });
        }

        res.json(result.data || []);

    } catch (error) {
        console.error("Holiday API Error:", error.message);
        res.status(500).json({ message: error.message });
    }
});
// CONNECT TO MONGODB AND START SERVER

module.exports = app;