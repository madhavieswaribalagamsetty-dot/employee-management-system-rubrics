
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Login from "./Login.jsx";
import { fetchEmployees } from "./redux/employeeSlice";

function App() {
    const dispatch = useDispatch();

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const { employees, loading, error } = useSelector(
        (state) => state.employees
    );

    useEffect(() => {
        if (isLoggedIn) {
            dispatch(fetchEmployees());
        }
    }, [isLoggedIn, dispatch]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
    };

    if (!isLoggedIn) {
        return (
            <Login onLogin={() => setIsLoggedIn(true)} />
        );
    }

    return (
        <div style={{ padding: "30px", fontFamily: "Arial" }}>
            <h1>Employee Management System</h1>

            <p>Manage your employee records</p>

            <button onClick={() => dispatch(fetchEmployees())}>
                Load Employees
            </button>

            <button
                onClick={handleLogout}
                style={{ marginLeft: "10px" }}
            >
                Logout
            </button>

            {loading && <p>Loading employees...</p>}

            {error && <p style={{ color: "red" }}>{error}</p>}

            <h2>Employee Details</h2>

            <table border="1" cellPadding="10" width="100%">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>Salary</th>
                    </tr>
                </thead>

                <tbody>
                    {employees.map((employee) => (
                        <tr key={employee.id || employee._id}>
                            <td>{employee.name}</td>
                            <td>{employee.email}</td>
                            <td>{employee.department}</td>
                            <td>{employee.role}</td>
                            <td>{employee.phone}</td>
                            <td>{employee.salary}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;
