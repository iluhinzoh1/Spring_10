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
                .map(option => ({ id: parseInt(option.dataset.roleId) })) // Отправляем id ролей
        };

        const response = await fetch(`/api/admin/users/${currentUserEditId}`, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser)
        });

        if (!response.ok) throw new Error('Ошибка изменения');
        editModal.hide();
        await loadAllUsers();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось изменить пользователя: ' + error.message);
    }
});

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
