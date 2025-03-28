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
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

async function handleAction(action, userId, userData) {
    if (action === 'Edit') {
        console.log('Edit user:', userId);
        // Логика для редактирования
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
