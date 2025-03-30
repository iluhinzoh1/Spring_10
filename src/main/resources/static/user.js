async function loadCurrentUser2() {
    try {
        const response = await fetch('/api/user/me');

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
document.addEventListener('DOMContentLoaded', loadCurrentUser2);

async function loadUser2() {
    try {
        const resp = await fetch('/api/user/me');
        if (!resp.ok) throw new Error('Ошибка загрузки данных');
        const userData = await resp.json(); // Получаем ОДНОГО пользователя

        const tbody2 = document.getElementById('tbody2');
        tbody2.innerHTML = ''; // Очищаем таблицу

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

document.addEventListener('DOMContentLoaded', loadUser2);
