// src/main/resources/static/js/data.js

let employees = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', department: 'IT', role: 'Developer' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', department: 'HR', role: 'Manager' },
    { id: 3, firstName: 'Peter', lastName: 'Jones', email: 'peter.jones@example.com', department: 'Finance', role: 'Accountant' },
    { id: 4, firstName: 'Alice', lastName: 'Brown', email: 'alice.b@example.com', department: 'Marketing', role: 'Specialist' },
    { id: 5, firstName: 'Bob', lastName: 'White', email: 'bob.w@example.com', department: 'IT', role: 'Support' },
    { id: 6, firstName: 'Charlie', lastName: 'Green', email: 'charlie.g@example.com', department: 'HR', role: 'Recruiter' },
    { id: 7, firstName: 'Diana', lastName: 'Black', email: 'diana.b@example.com', department: 'Finance', role: 'Analyst' },
    { id: 8, firstName: 'Eve', lastName: 'Grey', email: 'eve.g@example.com', department: 'Marketing', role: 'Coordinator' },
    { id: 9, firstName: 'Frank', lastName: 'Blue', email: 'frank.b@example.com', department: 'IT', role: 'Team Lead' },
    { id: 10, firstName: 'Grace', lastName: 'Red', email: 'grace.r@example.com', department: 'HR', role: 'Assistant' },
    { id: 11, firstName: 'Henry', lastName: 'Violet', email: 'henry.v@example.com', department: 'Finance', role: 'Controller' },
    { id: 12, firstName: 'Ivy', lastName: 'Gold', email: 'ivy.g@example.com', department: 'Marketing', role: 'Manager' }
];

// Initialize nextEmployeeId to be one greater than the maximum existing ID, or 1 if the array is empty.
let nextEmployeeId = employees.length > 0 ? Math.max(...employees.map(emp => emp.id)) + 1 : 1;