document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('user-modal');
    const addUserBtn = document.getElementById('add-user-btn');
    const closeBtn = document.querySelector('.close-btn');
    const userForm = document.getElementById('user-form');
    const modalTitle = document.getElementById('modal-title');
    const userIdInput = document.getElementById('user-id');
    const passwordInput = document.getElementById('password');

    // --- Modal Handling ---
    const openModal = () => modal.style.display = 'flex';
    const closeModal = () => modal.style.display = 'none';

    addUserBtn.onclick = () => {
        userForm.reset();
        userIdInput.value = '';
        modalTitle.textContent = 'Add New User';
        if (passwordInput) passwordInput.required = true;
        openModal();
    };

    closeBtn.onclick = closeModal;
    window.onclick = (event) => {
        if (event.target == modal) {
            closeModal();
        }
    };

    // --- Form Submission (Add/Edit) ---
    userForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userId = userIdInput.value;
        const formData = new FormData(userForm);

        const isEdit = !!userId;
        const url = isEdit ? `/admin/users/${userId}` : '/admin/users';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save user.');
            }

            closeModal();
            fetchUsers();

        } catch (error) {
            console.error('Error saving user:', error);
            alert(`Could not save user: ${error.message}`);
        }
    });

    // --- Event Delegation for Edit/Delete Buttons ---
    const userTableBody = document.getElementById('user-table-body');
    userTableBody.addEventListener('click', async (event) => {
        const target = event.target.closest('button');
        if (!target) return;

        const userId = target.dataset.userId;

        // Handle Edit
        if (target.classList.contains('edit-user-btn')) {
            const row = target.closest('tr');
                const userId = target.dataset.userId;

                // Optional: Fetch full user info from backend
                const response = await fetch(`/admin/users/${userId}`);
                if (!response.ok) {
                alert('Failed to load user data.');
                return;
                }
                const user = await response.json();

                userForm.reset();
                modalTitle.textContent = 'Edit User';
                userIdInput.value = user.user_id;
                document.getElementById('username').value = user.username || '';
                document.getElementById('email').value = user.email || '';
                document.getElementById('date_of_birth').value = user.date_of_birth || '';
                document.getElementById('address').value = user.address || '';
                document.getElementById('is_admin').checked = user.is_admin === 1;

                if (passwordInput) passwordInput.required = false;

                openModal();

        }

        // Handle Delete
        if (target.classList.contains('delete-user-btn')) {
            if (confirm(`Are you sure you want to delete this user?`)) {
                try {
                    const response = await fetch(`/admin/users/${userId}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) throw new Error('Failed to delete user');
                    fetchUsers();

                } catch (error) {
                    console.error('Error deleting user:', error);
                    alert('Could not delete user.');
                }
            }
        }
    });

    // Initial fetch of users
    fetchUsers();
});

async function fetchUsers() {
    try {
        const response = await fetch('/admin/users');
        if (!response.ok) throw new Error('Failed to fetch users');

        const users = await response.json();
        renderUserTable(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        document.getElementById('user-table-body').innerHTML = `<tr><td colspan="7">Failed to load users.</td></tr>`;
    }
}

function renderUserTable(users) {
    const userTableBody = document.getElementById('user-table-body');
    userTableBody.innerHTML = '';

    if (users.length === 0) {
        userTableBody.innerHTML = `<tr><td colspan="7">No users found.</td></tr>`;
        return;
    }

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.user_id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.date_of_birth ? user.date_of_birth.slice(0, 10) : ''}</td>
            <td>${user.address || ''}</td>
            <td>${new Date(user.created_at).toLocaleString()}</td>
            <td class="actions-cell">
                <button class="btn btn-edit edit-user-btn" data-user-id="${user.user_id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger delete-user-btn" data-user-id="${user.user_id}">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}
