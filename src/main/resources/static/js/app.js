// src/main/resources/static/js/app.js

// --- DOM Elements ---
const dashboardView = document.getElementById('dashboard-view');
const formView = document.getElementById('form-view');
const addEmployeeBtn = document.getElementById('add-employee-btn');
const employeeListContainer = document.getElementById('employee-list-container');
const employeeForm = document.getElementById('employee-form');
const formTitle = document.getElementById('form-title');
const cancelBtn = document.getElementById('cancel-btn');
const saveFormBtn = employeeForm.querySelector('.btn-save-form'); // Get the save/add button

// Form fields
const employeeIdField = document.getElementById('employee-id');
const firstNameField = document.getElementById('firstName');
const lastNameField = document.getElementById('lastName');
const emailField = document.getElementById('email');
const departmentField = document.getElementById('department');
const roleField = document.getElementById('role');

// Error message elements
const firstNameError = document.getElementById('firstName-error');
const lastNameError = document.getElementById('lastName-error');
const emailError = document.getElementById('email-error');
const departmentError = document.getElementById('department-error');
const roleError = document.getElementById('role-error');

// Search, Filter, Sort elements
const searchInput = document.getElementById('search-input'); // Header search input
const headerFilterBtn = document.getElementById('header-filter-btn'); // The filter button in the header

// Filter Sidebar elements
const filterSidebar = document.getElementById('filter-sidebar');
const mainContentArea = document.querySelector('.main-content-area'); // Reference to the main content area
const sidebarFirstNameInput = document.getElementById('sidebar-first-name');
const sidebarDepartmentInput = document.getElementById('sidebar-department');
const sidebarRoleInput = document.getElementById('sidebar-role');
const sidebarApplyBtn = document.getElementById('sidebar-apply-btn');
const sidebarResetBtn = document.getElementById('sidebar-reset-btn');

const sortBy = document.getElementById('sort-by');

// Pagination elements
const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const pageInfoSpan = document.getElementById('page-info');
const itemsPerPageSelect = document.getElementById('items-per-page');

// --- Global State Variables ---
// `employees` array and `nextEmployeeId` are imported from data.js
let currentEmployeeId = null; // Used for edit mode
let currentPage = 1;
let itemsPerPage = parseInt(itemsPerPageSelect.value); // Default from select
let currentFilters = {
    search: '', // For header search by name or email
    firstName: '', // For sidebar filter by first name
    department: '', // For sidebar filter by department
    role: '' // For sidebar filter by role
};
let currentSort = sortBy.value; // Default from select


// --- Utility Functions ---

/**
 * Renders the employee list based on current filters, sort, and pagination.
 */
function renderEmployeeList() {
    // 1. Apply Filters
    let filteredEmployees = employees.filter(employee => {
        // Header Search (Name or Email)
        const matchesSearch = employee.firstName.toLowerCase().includes(currentFilters.search) ||
                              employee.lastName.toLowerCase().includes(currentFilters.search) ||
                              employee.email.toLowerCase().includes(currentFilters.search);

        // Sidebar Filters
        const matchesFirstName = currentFilters.firstName === '' || employee.firstName.toLowerCase().includes(currentFilters.firstName);
        const matchesDepartment = currentFilters.department === '' || employee.department.toLowerCase().includes(currentFilters.department);
        const matchesRole = currentFilters.role === '' || employee.role.toLowerCase().includes(currentFilters.role);

        return matchesSearch && matchesFirstName && matchesDepartment && matchesRole;
    });

    // 2. Apply Sort
    filteredEmployees.sort((a, b) => {
        switch (currentSort) {
            case 'firstNameAsc':
                return a.firstName.localeCompare(b.firstName);
            case 'firstNameDesc':
                return b.firstName.localeCompare(a.firstName);
            case 'departmentAsc':
                return a.department.localeCompare(b.department);
            case 'departmentDesc':
                return b.department.localeCompare(a.department);
            default:
                return 0; // No specific sort if default option is selected
        }
    });

    // 3. Apply Pagination
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages; // Adjust current page if filtering/sorting reduces total pages
    } else if (totalPages === 0) {
        currentPage = 0; // No pages if no results
    } else if (currentPage === 0 && totalPages > 0) {
        currentPage = 1; // Reset to first page if no results and then new results appear
    }


    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredEmployees.length);
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

    employeeListContainer.innerHTML = ''; // Clear previous list

    if (paginatedEmployees.length === 0) {
        employeeListContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; margin-top: 50px; font-size: 1.2em; color: #666;">No employees found matching your criteria.</p>';
    } else {
        paginatedEmployees.forEach(employee => {
            const employeeCard = document.createElement('div');
            employeeCard.classList.add('employee-card');
            employeeCard.setAttribute('data-employee-id', employee.id);

            employeeCard.innerHTML = `
                <h3>${employee.firstName} ${employee.lastName}</h3>
                <p>Email: ${employee.email}</p>
                <p>Department: ${employee.department}</p>
                <p>Role: ${employee.role}</p>
                <div class="card-actions">
                    <button class="btn btn-edit" data-id="${employee.id}">Edit</button>
                    <button class="btn btn-delete" data-id="${employee.id}">Delete</button>
                </div>
            `;
            employeeListContainer.appendChild(employeeCard);
        });
    }

    updatePaginationControls(totalPages);
}

/**
 * Updates the state and visibility of pagination buttons.
 * @param {number} totalPages - The total number of pages based on current filters.
 */
function updatePaginationControls(totalPages) {
    pageInfoSpan.textContent = `Page ${totalPages > 0 ? currentPage : 0} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    if (totalPages === 0) {
        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;
    }
}

/**
 * Clears the form fields and error messages.
 */
function clearForm() {
    employeeForm.reset(); // Resets all form fields
    employeeIdField.value = ''; // Ensure hidden ID is cleared
    clearErrorMessages();
}

/**
 * Clears all validation error messages.
 */
function clearErrorMessages() {
    firstNameError.textContent = '';
    lastNameError.textContent = '';
    emailError.textContent = '';
    departmentError.textContent = '';
    roleError.textContent = '';
}

/**
 * Displays a validation error message for a specific field.
 * @param {HTMLElement} errorElement - The DOM element to display the error.
 * @param {string} message - The error message.
 */
function displayError(errorElement, message) {
    errorElement.textContent = message;
}

/**
 * Validates the employee form fields.
 * @returns {boolean} True if all fields are valid, false otherwise.
 */
function validateForm() {
    let isValid = true;
    clearErrorMessages(); // Clear previous errors

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (firstNameField.value.trim() === '') {
        displayError(firstNameError, 'First Name is required.');
        isValid = false;
    }
    if (lastNameField.value.trim() === '') {
        displayError(lastNameError, 'Last Name is required.');
        isValid = false;
    }
    if (emailField.value.trim() === '') {
        displayError(emailError, 'Email is required.');
        isValid = false;
    } else if (!emailRegex.test(emailField.value.trim())) {
        displayError(emailError, 'Invalid email format.');
        isValid = false;
    }
    if (departmentField.value === '') {
        displayError(departmentError, 'Department is required.');
        isValid = false;
    }
    if (roleField.value.trim() === '') {
        displayError(roleError, 'Role is required.');
        isValid = false;
    }

    return isValid;
}

/**
 * Switches between dashboard and form views.
 * Also manages sidebar visibility.
 * @param {string} view - 'dashboard' or 'form'.
 */
function switchView(view) {
    if (view === 'dashboard') {
        dashboardView.classList.remove('hidden'); // Show dashboard
        formView.classList.add('hidden'); // Hide form
        // Ensure sidebar is hidden when switching to dashboard
        filterSidebar.classList.remove('open');
        filterSidebar.classList.add('hidden-initially'); // Re-apply display: none after closing
        mainContentArea.classList.remove('sidebar-open');
    } else { // view === 'form'
        dashboardView.classList.add('hidden'); // Hide dashboard
        formView.classList.remove('hidden'); // Show form
        // Ensure sidebar is hidden when in form view
        filterSidebar.classList.remove('open');
        filterSidebar.classList.add('hidden-initially'); // Re-apply display: none after closing
        mainContentArea.classList.remove('sidebar-open');
    }
}

// --- Event Handlers ---

/**
 * Handles clicks on the employee list (delegation for Edit and Delete buttons).
 * @param {Event} event - The click event.
 */
employeeListContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-delete')) {
        const employeeIdToDelete = parseInt(event.target.dataset.id);
        if (confirm(`Are you sure you want to delete employee ID ${employeeIdToDelete}?`)) {
            // Filter out the employee to be deleted
            employees = employees.filter(emp => emp.id !== employeeIdToDelete);
            renderEmployeeList(); // Re-render the list to reflect the deletion
            alert('Employee deleted successfully!');
        }
    } else if (event.target.classList.contains('btn-edit')) {
        const employeeIdToEdit = parseInt(event.target.dataset.id);
        const employeeToEdit = employees.find(emp => emp.id === employeeIdToEdit);

        if (employeeToEdit) {
            formTitle.textContent = 'Edit Employee';
            saveFormBtn.textContent = 'Save'; // Change button text to 'Save'
            employeeIdField.value = employeeToEdit.id;
            firstNameField.value = employeeToEdit.firstName;
            lastNameField.value = employeeToEdit.lastName;
            emailField.value = employeeToEdit.email;
            departmentField.value = employeeToEdit.department;
            roleField.value = employeeToEdit.role;

            currentEmployeeId = employeeToEdit.id; // Set current employee for saving
            switchView('form');
        } else {
            alert('Employee not found for editing.');
        }
    }
});

/**
 * Handles the Add New Employee button click.
 */
addEmployeeBtn.addEventListener('click', () => {
    formTitle.textContent = 'Add New Employee';
    saveFormBtn.textContent = 'Add'; // Change button text to 'Add'
    clearForm();
    currentEmployeeId = null; // Clear ID to indicate add mode
    switchView('form');
});

/**
 * Handles the Cancel button click in the form.
 */
cancelBtn.addEventListener('click', () => {
    clearForm();
    currentEmployeeId = null;
    switchView('dashboard');
});

/**
 * Handles form submission (Add/Edit Employee).
 * @param {Event} event - The form submit event.
 */
employeeForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission

    if (!validateForm()) {
        return; // Stop if validation fails
    }

    const employeeData = {
        firstName: firstNameField.value.trim(),
        lastName: lastNameField.value.trim(),
        email: emailField.value.trim(),
        department: departmentField.value,
        role: roleField.value.trim()
    };

    if (currentEmployeeId) {
        // Edit existing employee
        const index = employees.findIndex(emp => emp.id === currentEmployeeId);
        if (index !== -1) {
            employees[index] = { ...employees[index], ...employeeData };
            alert('Employee updated successfully!');
        } else {
            alert('Error: Employee not found for update.');
        }
    } else {
        // Add new employee
        const newEmployee = {
            id: nextEmployeeId++, // Use the global counter for unique IDs
            ...employeeData
        };
        employees.push(newEmployee); // Add the new employee object to the 'employees' array
        alert('Employee added successfully!');
    }

    clearForm();
    currentEmployeeId = null;
    renderEmployeeList(); // Re-render the list with updated data
    switchView('dashboard');
});

// --- Search, Filter, Sort Event Listeners ---

// Header Search Input
searchInput.addEventListener('input', (event) => {
    currentFilters.search = event.target.value.toLowerCase().trim();
    currentPage = 1; // Reset to first page on new search
    renderEmployeeList();
});

// Header Filter Button (Toggles Sidebar)
headerFilterBtn.addEventListener('click', () => {
    if (filterSidebar.classList.contains('hidden-initially')) {
        filterSidebar.classList.remove('hidden-initially'); // Remove display:none
        // Allow a tiny moment for display to change before starting width transition
        setTimeout(() => {
            filterSidebar.classList.add('open');
            mainContentArea.classList.add('sidebar-open');
        }, 10);
    } else {
        filterSidebar.classList.remove('open');
        mainContentArea.classList.remove('sidebar-open');
        // Add event listener to re-apply hidden-initially AFTER transition finishes
        filterSidebar.addEventListener('transitionend', function handler() {
            // Check if the sidebar is truly closed (no 'open' class) before hiding completely
            if (!filterSidebar.classList.contains('open')) {
                filterSidebar.classList.add('hidden-initially');
            }
            // Remove the event listener to prevent it from firing multiple times
            filterSidebar.removeEventListener('transitionend', handler);
        });
    }

    // If sidebar is opened (or about to be opened), populate filter fields
    if (filterSidebar.classList.contains('open') || !filterSidebar.classList.contains('hidden-initially')) {
        sidebarFirstNameInput.value = currentFilters.firstName;
        sidebarDepartmentInput.value = currentFilters.department;
        sidebarRoleInput.value = currentFilters.role;
    }
});

// Sidebar Apply Button
sidebarApplyBtn.addEventListener('click', () => {
    currentFilters.firstName = sidebarFirstNameInput.value.toLowerCase().trim();
    currentFilters.department = sidebarDepartmentInput.value.toLowerCase().trim();
    currentFilters.role = sidebarRoleInput.value.toLowerCase().trim();
    currentPage = 1; // Reset to first page on new filter
    renderEmployeeList();
});

// Sidebar Reset Button
sidebarResetBtn.addEventListener('click', () => {
    sidebarFirstNameInput.value = '';
    sidebarDepartmentInput.value = '';
    sidebarRoleInput.value = '';
    currentFilters.firstName = '';
    currentFilters.department = '';
    currentFilters.role = '';
    currentPage = 1; // Reset to first page
    renderEmployeeList();
});

sortBy.addEventListener('change', (event) => {
    currentSort = event.target.value;
    currentPage = 1; // Reset to first page on new sort
    renderEmployeeList();
});

// --- Pagination Event Listeners ---

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderEmployeeList();
    }
});

nextPageBtn.addEventListener('click', () => {
    // Recalculate total pages based on current filters for accurate next page check
    const filteredEmployees = employees.filter(employee => {
        const matchesSearch = employee.firstName.toLowerCase().includes(currentFilters.search) ||
                              employee.lastName.toLowerCase().includes(currentFilters.search) ||
                              employee.email.toLowerCase().includes(currentFilters.search);
        const matchesFirstName = currentFilters.firstName === '' || employee.firstName.toLowerCase().includes(currentFilters.firstName);
        const matchesDepartment = currentFilters.department === '' || employee.department.toLowerCase().includes(currentFilters.department);
        const matchesRole = currentFilters.role === '' || employee.role.toLowerCase().includes(currentFilters.role);
        return matchesSearch && matchesFirstName && matchesDepartment && matchesRole;
    });
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    if (currentPage < totalPages) {
        currentPage++;
        renderEmployeeList();
    }
});

itemsPerPageSelect.addEventListener('change', (event) => {
    itemsPerPage = parseInt(event.target.value);
    currentPage = 1; // Reset to first page when items per page changes
    renderEmployeeList();
});


// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    // Make sure the dashboard is visible and the form/sidebar are hidden on initial load
    switchView('dashboard'); // Ensures dashboard is shown, and form/sidebar are hidden
    renderEmployeeList(); // This is crucial for displaying employees initially
});