// Функция для загрузки данных текущего пользователя
async function loadCurrentUser() {
    try {
        const response = await fetch('/api/admin/me');

        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        const user = await response.json();

        document.getElementById('currentUsername').textContent = user.username;
        document.getElementById('currentRoles').textContent = user.roles
            .map(role => role.name.replace('ROLE_', ''))
            .join(' ');

    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Загружаем данные при старте
document.addEventListener('DOMContentLoaded', loadCurrentUser);


///////////////для отображения, удаления и редактирования//////////////////////
function createCell(content) {
    const td = document.createElement('td');
    td.textContent = content;
    return td;
}

let currentUserId = null;
let currentUserEditId = null;
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
const editModal = new bootstrap.Modal(document.getElementById('editModal'));

async function handleAction(action, userId, userData) {
    if (action === 'Edit') {
        currentUserEditId = userId;
        document.getElementById('editUserId').value = userId;
        document.getElementById('editFirstName').value = userData.firstName;
        document.getElementById('editLastName').value = userData.lastName;
        document.getElementById('editAge').value = userData.age;
        document.getElementById('editUsername').value = userData.username;

        const rolesSelectEdit = document.getElementById('editRoles');
        rolesSelectEdit.innerHTML = ''; // Очищаем предыдущие значения

        const response = await fetch('/api/admin/roles'); // Правильный endpoint для ролей
        const roles = await response.json();

        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.name;
            option.textContent = role.name.replace('ROLE_', '');
            option.dataset.roleId = role.id;
            // Помечаем выбранные роли пользователя
            if (userData.roles.some(userRole => userRole.name === role.name)) {
                option.selected = true;
            }
            rolesSelectEdit.appendChild(option);
        });
        console.log('Edit user:', userId);
        editModal.show();


    } else if (action === 'Delete') {
        currentUserId = userId;

        // Заполняем модальное окно данными
        document.getElementById('deleteUserId').value = userId;
        document.getElementById('deleteFirstName').value = userData.firstName;
        document.getElementById('deleteLastName').value = userData.lastName;
        document.getElementById('deleteAge').value = userData.age;
        document.getElementById('deleteUsername').value = userData.username;

        const rolesSelect = document.getElementById('deleteRoles');
        rolesSelect.innerHTML = ''; // Очищаем предыдущие значения

        userData.roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.name; // Значение опции
            option.textContent = role.name.replace('ROLE_', ''); // Отображаемый текст
            rolesSelect.appendChild(option);
        });
        // Показываем модальное окно
        deleteModal.show();
    }
}

// Обработчик подтверждения удаления
function createActionCell(action, userId, userData) {
    const td = document.createElement('td');
    const button = document.createElement('button');
    button.className = `btn btn-${action === 'Edit' ? 'primary' : 'danger'} btn-sm`;
    button.textContent = action;
    button.onclick = () => handleAction(action, userId, userData); // Передаем userData
    td.appendChild(button);
    return td;
}

// загружаем юзеров
document.getElementById('confirmDelete').addEventListener('click', async () => {
    try {
        const response = await fetch(`/api/admin/users/${currentUserId}`, {
            method: "DELETE"
        });
        if (!response.ok) throw new Error('Ошибка удаления');
        deleteModal.hide();
        await loadAllUsers(); // Перезагружаем данные
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось удалить пользователя');
    }
});

document.getElementById('confirmEdit').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const newPassword = document.getElementById('newPassword').value.trim();
        const updatedUser = {
            id: currentUserEditId,
            firstName: document.getElementById('editFirstName').value,
            lastName: document.getElementById('editLastName').value,
            age: document.getElementById('editAge').value,
            username: document.getElementById('editUsername').value,
            password: newPassword || undefined,
            roles: Array.from(document.getElementById('editRoles').selectedOptions)
                .map(option => ({id: parseInt(option.dataset.roleId)})) // Отправляем id ролей
        };

        const currentUserResponse = await fetch('/api/admin/me');
        const currentUser = await currentUserResponse.json();

        const response = await fetch(`/api/admin/users/${currentUserEditId}`, {
            method: "PUT",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(updatedUser)
        });

        if (currentUser.id === currentUserEditId) {
            // Проверяем изменения
            const usernameChanged = currentUser.username !== updatedUser.username;
            const rolesChanged = !arraysEqual(
                currentUser.roles.map(r => r.id),
                updatedUser.roles.map(r => r.id)
            );

            if (usernameChanged || rolesChanged) {
                // Перенаправляем на страницу входа
                window.location.href = '/login';
                return; // Прерываем выполнение
            }
        }

        if (!response.ok) throw new Error('Ошибка изменения');
        editModal.hide();
        await loadAllUsers();
        await loadCurrentUser();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось изменить пользователя: ' + error.message);
    }
});

function arraysEqual(a, b) {
    return a.length === b.length && a.every((val, index) => val === b[index]);
}

// Функция загрузки пользователей
async function loadAllUsers() {
    try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) throw new Error('Ошибка загрузки пользователей');
        const usersData = await response.json();
        const tbody = document.getElementById('tbody-1');
        tbody.innerHTML = ''; // Очищаем таблицу

        usersData.forEach(user => {
            const tr = document.createElement('tr');
            tr.append(
                createCell(user.id),
                createCell(user.firstName),
                createCell(user.lastName),
                createCell(user.age),
                createCell(user.username),
                createCell(user.roles.map(role => role.name.replace('ROLE_', '')).join(', ')),
                createActionCell('Edit', user.id, user),
                createActionCell('Delete', user.id, user)
            );
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadAllUsers);

document.getElementById('newUser').addEventListener('click', async (e) => {
    e.preventDefault();
    const form = document.querySelector('form');
    try {
        const password = document.getElementById('password').value;

        const rolesResponse = await fetch('/api/admin/roles');
        const allRoles = await rolesResponse.json();

        document.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });

        // 2. Проверка полей
        const fieldsToValidate = [
            {id: 'firstName', message: 'Введите имя'},
            {id: 'lastName', message: 'Введите фамилию'},
            {id: 'age', message: 'Введите возраст'},
            {id: 'email', message: 'Введите email'},
            {id: 'password', message: 'Введите пароль'},
            {id: 'addRoles', message: 'Выберите хотя бы одну роль'}
        ];

        let isValid = true;

        for (const field of fieldsToValidate) {
            const element = document.getElementById(field.id);
            const value = element.value.trim();

            // Специальная проверка для select multiple
            if (field.id === 'addRoles') {
                const selectedOptions = element.selectedOptions;
                if (selectedOptions.length === 0) {
                    isValid = false;
                    element.closest('.form-floating').classList.add('is-invalid');
                }
                continue;
            }

            // Проверка для остальных полей
            if (!value) {
                isValid = false;
                element.classList.add('is-invalid');
                element.parentElement.insertAdjacentHTML('afterend',
                    `<div class="invalid-feedback">${field.message}</div>`);
            }
        }

        if (!isValid) {
            throw new Error('Заполните все обязательные поля');
        }

        const newUser = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            age: document.getElementById('age').value,
            username: document.getElementById('email').value,
            password: password,
            roles: Array.from(document.getElementById('addRoles').selectedOptions)
                .map(option => {
                    const roleId = parseInt(option.dataset.roleId);
                    return allRoles.find(role => role.id === roleId);
                })
        };

        const newResponse = await fetch(`/api/admin/users`, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newUser)
        });

        form.reset();
        if (!newResponse.ok) throw new Error('Ошибка добавления');
        await loadAllUsers();
        await loadCurrentUser();

        document.querySelector('[data-bs-target="#nav-home"]').click();

    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось добавить пользователя: ' + error.message);
    }
});

async function loadRolesForAddForm() {
    try {
        const response = await fetch('/api/admin/roles');
        const roles = await response.json();
        const select = document.getElementById('addRoles');

        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.name;
            option.textContent = role.name.replace('ROLE_', '');
            option.dataset.roleId = role.id; // Добавьте это
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка загрузки ролей:', error);
    }
}

// Вызовите при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadAllUsers();
    loadCurrentUser();
    loadRolesForAddForm();
});

async function loadUser() {
    try {
        const resp = await fetch('/api/admin/me');
        if (!resp.ok) throw new Error('Ошибка загрузки данных');
        const userData = await resp.json(); // Получаем ОДНОГО пользователя

        const tbody2 = document.getElementById('tbody2');
        tbody2.innerHTML = ''; // Очищаем таблицу

        // Создаем строку только для одного пользователя
        const tr2 = document.createElement('tr');
        tr2.innerHTML = `
            <td>${userData.id}</td>
            <td>${userData.firstName}</td>
            <td>${userData.lastName}</td>
            <td>${userData.age}</td>
            <td>${userData.username}</td>
            <td>${userData.roles.map(role => role.name.replace('ROLE_', '')).join(', ')}</td>
        `;

        tbody2.appendChild(tr2);
    } catch (error) {
        console.error('Ошибка:', error);
        tbody2.innerHTML = '<tr><td colspan="6">Ошибка загрузки данных</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', loadUser);