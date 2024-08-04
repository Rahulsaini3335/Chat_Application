const ws = new WebSocket('ws://localhost:8080');
let username = '';

document.getElementById('loginButton').onclick = () => {
    username = document.getElementById('usernameInput').value;
    if (username) {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('chatContainer').style.display = 'block';
        ws.send(JSON.stringify({ type: 'login', username }));
    }
};

document.getElementById('createRoomButton').onclick = () => {
    const newRoom = document.getElementById('newRoomInput').value;
    if (newRoom) {
        ws.send(JSON.stringify({ type: 'createRoom', room: newRoom }));
        document.getElementById('newRoomInput').value = '';
    }
};

document.getElementById('sendMessageButton').onclick = () => {
    const message = document.getElementById('messageInput').value;
    if (message) {
        ws.send(JSON.stringify({ type: 'message', message, username }));
        document.getElementById('messageInput').value = '';
    }
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
        case 'updateRoomList':
            const roomList = document.getElementById('roomList');
            roomList.innerHTML = '';
            data.rooms.forEach(room => {
                const li = document.createElement('li');
                li.textContent = room;
                li.onclick = () => {
                    ws.send(JSON.stringify({ type: 'joinRoom', room }));
                    document.getElementById('roomTitle').textContent = room;
                };
                roomList.appendChild(li);
            });
            break;
        case 'message':
            const messageDisplay = document.getElementById('messageDisplay');
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = `${data.username}: ${data.message}`;
            messageDisplay.appendChild(messageElement);
            messageDisplay.scrollTop = messageDisplay.scrollHeight;
            break;
    }
};
