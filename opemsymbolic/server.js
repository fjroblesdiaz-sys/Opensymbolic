const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Room management
const rooms = new Map();

function getRoomState(roomId) {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, {
            id: roomId,
            users: new Map(),
            chain: [],
            customConceptrons: [],
            createdAt: Date.now()
        });
    }
    return rooms.get(roomId);
}

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    let currentRoom = null;
    let currentUser = null;

    // Create or join a room
    socket.on('joinRoom', ({ roomId, username }) => {
        const room = getRoomState(roomId);
        
        currentRoom = roomId;
        currentUser = {
            id: socket.id,
            username: username || `User-${socket.id.slice(0, 4)}`,
            color: generateUserColor()
        };

        socket.join(roomId);
        room.users.set(socket.id, currentUser);

        // Send current room state to the new user
        socket.emit('roomState', {
            roomId,
            users: Array.from(room.users.values()),
            chain: room.chain,
            customConceptrons: room.customConceptrons
        });

        // Notify other users
        socket.to(roomId).emit('userJoined', currentUser);
        
        console.log(`${currentUser.username} joined room ${roomId}`);
    });

    // Create a new room
    socket.on('createRoom', ({ username }) => {
        const roomId = uuidv4().slice(0, 8);
        const room = getRoomState(roomId);
        
        currentRoom = roomId;
        currentUser = {
            id: socket.id,
            username: username || `User-${socket.id.slice(0, 4)}`,
            color: generateUserColor(),
            isHost: true
        };

        socket.join(roomId);
        room.users.set(socket.id, currentUser);

        socket.emit('roomCreated', {
            roomId,
            user: currentUser,
            roomState: {
                roomId,
                users: Array.from(room.users.values()),
                chain: room.chain,
                customConceptrons: room.customConceptrons
            }
        });

        console.log(`Room ${roomId} created by ${currentUser.username}`);
    });

    // Add conceptron to chain
    socket.on('addToChain', (conceptron) => {
        if (!currentRoom || !currentUser) return;

        const room = rooms.get(currentRoom);
        if (room) {
            const chainItem = {
                ...conceptron,
                id: uuidv4(),
                userId: socket.id,
                username: currentUser.username,
                timestamp: Date.now()
            };
            
            room.chain.push(chainItem);
            
            // Broadcast to all users in room
            io.to(currentRoom).emit('chainUpdated', {
                chain: room.chain,
                addedItem: chainItem
            });
        }
    });

    // Clear chain
    socket.on('clearChain', () => {
        if (!currentRoom) return;

        const room = rooms.get(currentRoom);
        if (room) {
            room.chain = [];
            io.to(currentRoom).emit('chainCleared', {
                clearedBy: currentUser?.username
            });
        }
    });

    // Remove item from chain
    socket.on('removeFromChain', (itemId) => {
        if (!currentRoom) return;

        const room = rooms.get(currentRoom);
        if (room) {
            room.chain = room.chain.filter(item => item.id !== itemId);
            io.to(currentRoom).emit('chainUpdated', {
                chain: room.chain,
                removedId: itemId
            });
        }
    });

    // Add custom conceptron
    socket.on('addCustomConceptron', (conceptron) => {
        if (!currentRoom) return;

        const room = rooms.get(currentRoom);
        if (room) {
            const customConceptron = {
                ...conceptron,
                id: uuidv4(),
                createdBy: currentUser?.username
            };
            
            room.customConceptrons.push(customConceptron);
            
            io.to(currentRoom).emit('customConceptronsUpdated', {
                customConceptrons: room.customConceptrons,
                added: customConceptron
            });
        }
    });

    // Remove custom conceptron
    socket.on('removeCustomConceptron', (conceptronId) => {
        if (!currentRoom) return;

        const room = rooms.get(currentRoom);
        if (room) {
            room.customConceptrons = room.customConceptrons.filter(c => c.id !== conceptronId);
            io.to(currentRoom).emit('customConceptronsUpdated', {
                customConceptrons: room.customConceptrons,
                removedId: conceptronId
            });
        }
    });

    // Play chain (sync all users)
    socket.on('playChain', () => {
        if (!currentRoom) return;
        
        io.to(currentRoom).emit('playChainSync', {
            playedBy: currentUser?.username,
            timestamp: Date.now()
        });
    });

    // User typing/status
    socket.on('updateStatus', (status) => {
        if (!currentRoom || !currentUser) return;
        
        currentUser.status = status;
        socket.to(currentRoom).emit('userStatusUpdate', {
            userId: socket.id,
            status
        });
    });

    // Send message to all users in room
    socket.on('sendMessage', (messageData) => {
        if (!currentRoom) return;

        const room = rooms.get(currentRoom);
        if (room) {
            io.to(currentRoom).emit('messageReceived', messageData);
            console.log(`Message sent by ${messageData.sender} in room ${currentRoom}`);
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        if (currentRoom) {
            const room = rooms.get(currentRoom);
            if (room) {
                room.users.delete(socket.id);
                
                io.to(currentRoom).emit('userLeft', {
                    userId: socket.id,
                    username: currentUser?.username
                });

                // Clean up empty rooms after 5 minutes
                if (room.users.size === 0) {
                    setTimeout(() => {
                        const r = rooms.get(currentRoom);
                        if (r && r.users.size === 0) {
                            rooms.delete(currentRoom);
                            console.log(`Room ${currentRoom} deleted (empty)`);
                        }
                    }, 5 * 60 * 1000);
                }
            }
        }
        
        console.log(`User disconnected: ${socket.id}`);
    });
});

function generateUserColor() {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFE66D', 
        '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3',
        '#FF9F43', '#A8E6CF', '#DDA0DD', '#87CEEB'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Handle SPA routing
app.get('/room/:roomId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║   ComunicaSímbolo Server v2.0            ║
║   =================================       ║
║   Server running on: http://localhost:${PORT}  ║
║   WebSocket: Enabled                      ║
║   Multiuser: Enabled                     ║
╚═══════════════════════════════════════════╝
    `);
});
