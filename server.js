const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let rooms = {};
let users = {};

server.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'login':
                users[data.username] = ws;
                ws.username = data.username;
                updateRoomList();
                break;
            case 'createRoom':
                rooms[data.room] = [];
                updateRoomList();
                break;
            case 'joinRoom':
                if (ws.currentRoom) {
                    rooms[ws.currentRoom] = rooms[ws.currentRoom].filter(user => user !== ws);
                }
                ws.currentRoom = data.room;
                rooms[data.room].push(ws);
                break;
            case 'message':
                rooms[ws.currentRoom].forEach(client => {
                    client.send(JSON.stringify({
                        type: 'message',
                        message: data.message,
                        username: data.username,
                    }));
                });
                break;
        }
    });

    ws.on('close', () => {
        if (ws.currentRoom) {
            rooms[ws.currentRoom] = rooms[ws.currentRoom].filter(user => user !== ws);
        }
        delete users[ws.username];
        updateRoomList();
    });

    function updateRoomList() {
        const roomNames = Object.keys(rooms);
        server.clients.forEach(client => {
            client.send(JSON.stringify({
                type: 'updateRoomList',
                rooms: roomNames,
            }));
        });
    }
});
