// OpenSymbolic v2.0 - Conceptrón Communication MVP
// With Multiuser Support via Socket.io

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    playTone(frequency, duration = 0.5, type = 'sine') {
        this.init();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.4, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.25, now + duration * 0.5);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    async playSequence(chain, onSymbolPlay) {
        if (chain.length === 0) return;
        
        this.isPlaying = true;
        
        for (let i = 0; i < chain.length; i++) {
            if (!this.isPlaying) break;
            
            const conceptron = chain[i];
            
            if (onSymbolPlay) {
                onSymbolPlay(conceptron, i);
            }
            
            this.playTone(conceptron.tone, 0.5);
            
            await new Promise(resolve => setTimeout(resolve, 650));
        }
        
        this.isPlaying = false;
    }

    async playScale() {
        this.init();
        const notes = [261, 293, 329, 349, 392, 440, 493, 523];
        
        for (const freq of notes) {
            this.playTone(freq, 0.2);
            await new Promise(resolve => setTimeout(resolve, 220));
        }
    }

    stop() {
        this.isPlaying = false;
    }
}

class Conceptron {
    constructor(color, shape, tone, name) {
        this.color = color;
        this.shape = shape;
        this.tone = tone;
        this.name = name || 'Símbolo';
    }

    toJSON() {
        return {
            c: this.color,
            f: this.shape,
            t: this.tone,
            n: this.name
        };
    }
}

class GenomeConverter {
    constructor() {
        this.baseMap = {
            'A': { base: 'A', color: '#FF6B6B', shape: 'circle', tone: 261 },
            'B': { base: 'C', color: '#FF6B6B', shape: 'triangle', tone: 277 },
            'C': { base: 'G', color: '#FF6B6B', shape: 'square', tone: 293 },
            'D': { base: 'T', color: '#4ECDC4', shape: 'circle', tone: 311 },
            'E': { base: 'A', color: '#4ECDC4', shape: 'triangle', tone: 329 },
            'F': { base: 'C', color: '#4ECDC4', shape: 'square', tone: 349 },
            'G': { base: 'G', color: '#45B7D1', shape: 'circle', tone: 369 },
            'H': { base: 'T', color: '#45B7D1', shape: 'triangle', tone: 392 },
            'I': { base: 'A', color: '#45B7D1', shape: 'square', tone: 415 },
            'J': { base: 'C', color: '#FFE66D', shape: 'circle', tone: 440 },
            'K': { base: 'G', color: '#FFE66D', shape: 'triangle', tone: 466 },
            'L': { base: 'T', color: '#FFE66D', shape: 'square', tone: 493 },
            'M': { base: 'A', color: '#95E1D3', shape: 'hexagon', tone: 523 },
            'N': { base: 'C', color: '#95E1D3', shape: 'star', tone: 554 },
            'Ñ': { base: 'G', color: '#95E1D3', shape: 'heart', tone: 587 },
            'O': { base: 'T', color: '#F38181', shape: 'circle', tone: 622 },
            'P': { base: 'A', color: '#F38181', shape: 'triangle', tone: 659 },
            'Q': { base: 'C', color: '#F38181', shape: 'square', tone: 698 },
            'R': { base: 'G', color: '#AA96DA', shape: 'circle', tone: 739 },
            'S': { base: 'T', color: '#AA96DA', shape: 'triangle', tone: 783 },
            'T': { base: 'A', color: '#AA96DA', shape: 'square', tone: 830 },
            'U': { base: 'C', color: '#FCBAD3', shape: 'hexagon', tone: 880 },
            'V': { base: 'G', color: '#FCBAD3', shape: 'star', tone: 932 },
            'W': { base: 'T', color: '#FCBAD3', shape: 'heart', tone: 987 },
            'X': { base: 'A', color: '#FF9F43', shape: 'circle', tone: 1046 },
            'Y': { base: 'C', color: '#FF9F43', shape: 'triangle', tone: 1108 },
            'Z': { base: 'G', color: '#FF9F43', shape: 'square', tone: 1174 },
            ' ': { base: '-', color: '#A8E6CF', shape: 'hexagon', tone: 0 }
        };

        for (let i = 0; i <= 9; i++) {
            this.baseMap[i.toString()] = { 
                base: ['A', 'C', 'G', 'T'][i % 4], 
                color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFE66D'][i % 4],
                shape: ['circle', 'triangle', 'square', 'hexagon'][i % 4],
                tone: 220 + (i * 100)
            };
        }
    }

    convert(text) {
        const upper = text.toUpperCase();
        const result = [];
        
        for (const char of upper) {
            if (this.baseMap[char]) {
                result.push({ char, ...this.baseMap[char] });
            } else if (/[a-z]/.test(char)) {
                const upperChar = char.toUpperCase();
                if (this.baseMap[upperChar]) {
                    result.push({ char, ...this.baseMap[upperChar] });
                }
            }
        }
        
        return result;
    }
}

class ConceptronApp {
    constructor() {
        this.audio = new AudioEngine();
        this.genome = new GenomeConverter();
        this.socket = null;
        this.roomId = null;
        this.currentUser = null;
        this.chain = [];
        this.customConceptrons = [];
        this.users = [];
        
        this.defaultConceptrons = [
            new Conceptron('#FF6B6B', 'circle', 440, 'Sí'),
            new Conceptron('#4ECDC4', 'triangle', 330, 'No'),
            new Conceptron('#FFE66D', 'star', 520, 'Gracias'),
            new Conceptron('#45B7D1', 'heart', 390, 'Ayuda'),
            new Conceptron('#AA96DA', 'hexagon', 470, 'Comida'),
            new Conceptron('#F38181', 'circle', 550, 'Agua'),
            new Conceptron('#95E1D3', 'square', 290, 'Dolor'),
            new Conceptron('#FF9F43', 'triangle', 410, 'Cansado'),
            new Conceptron('#FCBAD3', 'star', 480, 'Feliz'),
            new Conceptron('#A8E6CF', 'heart', 350, 'Triste'),
            new Conceptron('#FF6B6B', 'triangle', 600, 'Urgente'),
            new Conceptron('#4ECDC4', 'square', 280, 'Baño'),
            new Conceptron('#DDA0DD', 'diamond', 360, 'Miedo'),
            new Conceptron('#87CEEB', 'pentagon', 420, 'Sueño'),
            new Conceptron('#FFE4B5', 'moon', 500, 'Noche'),
            new Conceptron('#98D8C8', 'cross', 300, 'Bien')
        ];

        this.selectedColor = '#FF6B6B';
        this.selectedShape = 'circle';
        this.selectedTone = 440;

        this.init();
    }

    init() {
        this.renderDefaultConceptrons();
        this.bindEvents();
        this.initSocket();
        this.initDarkMode();
    }

    createShapeSVG(shape, color) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 40 40');
        svg.setAttribute('class', `shape ${shape}`);
        
        let element;
        
        const shapes = {
            circle: () => {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                element.setAttribute('cx', '20');
                element.setAttribute('cy', '20');
                element.setAttribute('r', '16');
            },
            triangle: () => {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                element.setAttribute('points', '20,4 36,36 4,36');
            },
            square: () => {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                element.setAttribute('x', '6');
                element.setAttribute('y', '6');
                element.setAttribute('width', '28');
                element.setAttribute('height', '28');
                element.setAttribute('rx', '3');
            },
            hexagon: () => {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                element.setAttribute('points', '20,2 37,11 37,29 20,38 3,29 3,11');
            },
            star: () => {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                element.setAttribute('points', '20,2 24,16 38,16 27,25 32,38 20,30 8,38 13,25 2,16 16,16');
            },
            heart: () => {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                element.setAttribute('d', 'M20,36 C6,28 2,16 10,8 C14,4 20,7 20,7 C20,7 26,4 30,8 C38,16 34,28 20,36');
            },
            diamond: () => {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                element.setAttribute('points', '20,2 38,20 20,38 2,20');
            },
            pentagon: () => {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                element.setAttribute('points', '20,2 38,15 32,38 8,38 2,15');
            },
            cross: () => {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                element.setAttribute('points', '17,2 23,2 23,17 38,17 38,23 23,23 23,38 17,38 17,23 2,23 2,17 17,17');
            },
            moon: () => {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                element.setAttribute('d', 'M20,4 A14,14 0 1,1 20,36 A10,10 0 1,0 20,4');
            }
        };
        
        (shapes[shape] || shapes.circle)();
        element.setAttribute('fill', color);
        svg.appendChild(element);
        
        return svg;
    }

    renderDefaultConceptrons() {
        const grid = document.getElementById('conceptronGrid');
        grid.innerHTML = '';

        const allConceptrons = [...this.defaultConceptrons, ...this.customConceptrons];

        allConceptrons.forEach((conceptron, index) => {
            const btn = document.createElement('button');
            btn.className = 'conceptron-btn';
            btn.style.backgroundColor = conceptron.color;
            
            const shape = this.createShapeSVG(conceptron.shape, 'rgba(0,0,0,0.35)');
            shape.classList.add('shape');
            btn.appendChild(shape);

            const label = document.createElement('span');
            label.className = 'label';
            label.textContent = conceptron.name;
            btn.appendChild(label);

            const customIndex = index - this.defaultConceptrons.length;
            if (customIndex >= 0) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = '×';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.removeCustomConceptron(customIndex);
                };
                btn.appendChild(deleteBtn);
            }

            btn.onclick = () => this.addToChain(conceptron);
            grid.appendChild(btn);
        });
    }

    bindEvents() {
        // Room tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.querySelector(`[data-content="${btn.dataset.tab}"]`).classList.add('active');
            };
        });

        // Create room
        document.getElementById('createRoomBtn').onclick = () => {
            const username = document.getElementById('createUsername').value.trim() || 'Anónimo';
            this.createRoom(username);
        };

        // Join room
        document.getElementById('joinRoomBtn').onclick = () => {
            const username = document.getElementById('joinUsername').value.trim() || 'Anónimo';
            const roomCode = document.getElementById('roomCode').value.trim();
            if (roomCode) {
                this.joinRoom(roomCode, username);
            } else {
                this.showToast('Ingresa el código de sala', 'error');
            }
        };

        // Copy room code
        document.getElementById('copyRoomCode').onclick = () => {
            navigator.clipboard.writeText(this.roomId);
            this.showToast('Código copiado', 'success');
        };

        // Color picker
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedColor = btn.dataset.color;
            };
        });

        // Shape picker
        document.querySelectorAll('.shape-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedShape = btn.dataset.shape;
            };
        });

        // Tone slider
        const toneSlider = document.getElementById('toneSlider');
        const toneValue = document.getElementById('toneValue');
        toneSlider.oninput = () => {
            this.selectedTone = parseInt(toneSlider.value);
            toneValue.textContent = `${this.selectedTone} Hz`;
        };

        // Preview tone
        document.getElementById('previewTone').onclick = () => {
            this.audio.playTone(this.selectedTone, 0.4);
        };

        // Play scale
        document.getElementById('playScale').onclick = () => {
            this.audio.playScale();
        };

        // Add conceptron
        document.getElementById('addConceptron').onclick = () => {
            const nameInput = document.getElementById('conceptronName');
            const name = nameInput.value.trim() || 'Mi símbolo';
            
            const newConceptron = new Conceptron(
                this.selectedColor,
                this.selectedShape,
                this.selectedTone,
                name
            );
            
            if (this.socket && this.roomId) {
                this.socket.emit('addCustomConceptron', newConceptron.toJSON());
            } else {
                this.customConceptrons.push(newConceptron);
            }
            
            this.renderDefaultConceptrons();
            nameInput.value = '';
            this.showToast('Símbolo añadido', 'success');
        };

        // Clear chain
        document.getElementById('clearChain').onclick = () => {
            if (this.socket && this.roomId) {
                this.socket.emit('clearChain');
            } else {
                this.chain = [];
                this.updateChainDisplay();
            }
        };

        // Play chain
        document.getElementById('playChain').onclick = () => {
            if (this.socket && this.roomId) {
                this.socket.emit('playChain');
            } else {
                this.playChain();
            }
        };

        // Stop playback
        document.getElementById('stopPlayback').onclick = () => {
            this.audio.stop();
            document.getElementById('stopPlayback').disabled = true;
            document.getElementById('chainDisplay').classList.remove('playing');
        };

        // Genome generator
        document.getElementById('generateGenome').onclick = () => {
            const input = document.getElementById('genomeInput');
            const text = input.value.trim();
            if (text) {
                this.generateGenome(text);
            }
        };

        document.getElementById('genomeInput').onkeypress = (e) => {
            if (e.key === 'Enter') {
                document.getElementById('generateGenome').click();
            }
        };

        // Export/Import
        document.getElementById('exportConceptrons').onclick = () => {
            this.exportConceptrons();
        };

        document.getElementById('importConceptrons').onclick = () => {
            document.getElementById('importFile').click();
        };

        document.getElementById('importFile').onchange = (e) => {
            this.importConceptrons(e.target.files[0]);
        };

        // Dark mode
        document.getElementById('darkModeToggle').onclick = () => {
            this.toggleDarkMode();
        };
    }

    initSocket() {
        this.socket = io();

        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('roomCreated', (data) => {
            this.roomId = data.roomId;
            this.currentUser = data.user;
            this.showRoomPanel(data.roomState);
            this.showToast(`Sala creada: ${data.roomId}`, 'success');
        });

        this.socket.on('roomState', (data) => {
            this.roomId = data.roomId;
            this.showRoomPanel(data);
        });

        this.socket.on('userJoined', (user) => {
            this.users.push(user);
            this.updateUsersList();
            this.showToast(`${user.username} se unió`, 'success');
        });

        this.socket.on('userLeft', (data) => {
            this.users = this.users.filter(u => u.id !== data.userId);
            this.updateUsersList();
        });

        this.socket.on('chainUpdated', (data) => {
            this.chain = data.chain;
            this.updateChainDisplay();
            
            if (data.addedItem) {
                this.audio.playTone(data.addedItem.tone, 0.3);
            }
        });

        this.socket.on('chainCleared', (data) => {
            this.chain = [];
            this.updateChainDisplay();
        });

        this.socket.on('customConceptronsUpdated', (data) => {
            this.customConceptrons = data.customConceptrons.map(c => 
                new Conceptron(c.color, c.shape, c.tone, c.name)
            );
            this.renderDefaultConceptrons();
            if (data.added) {
                this.showToast(`${data.added.createdBy} añadió: ${data.added.name}`, 'success');
            }
        });

        this.socket.on('playChainSync', (data) => {
            this.playChain();
        });
    }

    showRoomPanel(state) {
        document.getElementById('roomInfo').style.display = 'block';
        document.getElementById('displayRoomCode').textContent = this.roomId;
        
        this.users = state.users;
        this.updateUsersList();
        
        if (state.chain) {
            this.chain = state.chain;
            this.updateChainDisplay();
        }
        
        if (state.customConceptrons) {
            this.customConceptrons = state.customConceptrons.map(c => 
                new Conceptron(c.color, c.shape, c.tone, c.name)
            );
            this.renderDefaultConceptrons();
        }
        
        document.getElementById('mainContent').style.display = 'flex';
    }

    updateUsersList() {
        const list = document.getElementById('usersList');
        list.innerHTML = this.users.map(u => `
            <span class="user-badge">
                <span class="dot" style="background: ${u.color}"></span>
                ${u.username}
            </span>
        `).join('');
        
        document.getElementById('connectedUsers').textContent = this.users.length;
    }

    createRoom(username) {
        this.socket.emit('createRoom', { username });
    }

    joinRoom(roomId, username) {
        this.socket.emit('joinRoom', { roomId, username });
    }

    initDarkMode() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.updateDarkModeIcons();
        }
    }

    toggleDarkMode() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
        
        this.updateDarkModeIcons();
    }

    updateDarkModeIcons() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.querySelector('.icon-moon').style.display = isDark ? 'none' : 'inline';
        document.querySelector('.icon-sun').style.display = isDark ? 'inline' : 'none';
    }

    addToChain(conceptron) {
        if (this.chain.length >= 20) {
            this.showToast('Máximo 20 símbolos', 'error');
            return;
        }
        
        if (this.socket && this.roomId) {
            this.socket.emit('addToChain', conceptron.toJSON());
        } else {
            this.chain.push({
                ...conceptron.toJSON(),
                id: Date.now(),
                username: 'Tú'
            });
            this.updateChainDisplay();
            this.audio.playTone(conceptron.tone, 0.3);
        }
    }

    updateChainDisplay() {
        const display = document.getElementById('chainDisplay');
        
        if (this.chain.length === 0) {
            display.innerHTML = '<p class="placeholder-text">Toca los símbolos para crear tu mensaje</p>';
            document.getElementById('playChain').disabled = true;
        } else {
            display.innerHTML = '';
            this.chain.forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'chain-item';
                itemDiv.style.backgroundColor = item.color;
                
                const shape = this.createShapeSVG(item.shape, 'rgba(0,0,0,0.4)');
                shape.classList.add('shape');
                itemDiv.appendChild(shape);
                
                const name = document.createElement('span');
                name.className = 'name';
                name.textContent = item.name || item.n;
                itemDiv.appendChild(name);

                if (item.username) {
                    const userBadge = document.createElement('span');
                    userBadge.className = 'user-badge-mini';
                    userBadge.style.backgroundColor = item.userColor || '#6C63FF';
                    userBadge.textContent = item.username.charAt(0).toUpperCase();
                    itemDiv.appendChild(userBadge);
                }
                
                itemDiv.onclick = () => {
                    if (this.socket && this.roomId) {
                        this.socket.emit('removeFromChain', item.id);
                    } else {
                        this.chain.splice(index, 1);
                        this.updateChainDisplay();
                    }
                };
                
                display.appendChild(itemDiv);
            });
            
            document.getElementById('playChain').disabled = false;
        }
        
        document.getElementById('chainLength').textContent = this.chain.length;
    }

    async playChain() {
        if (this.chain.length === 0) return;
        
        document.getElementById('playChain').disabled = true;
        document.getElementById('stopPlayback').disabled = false;
        document.getElementById('chainDisplay').classList.add('playing');
        
        const chainData = this.chain.map(item => ({
            color: item.color || item.c,
            shape: item.shape || item.f,
            tone: item.tone || item.t,
            name: item.name || item.n
        }));
        
        await this.audio.playSequence(chainData, (conceptron, index) => {
            const items = document.querySelectorAll('.chain-item');
            items.forEach((item, i) => {
                if (i === index) {
                    item.classList.add('playing');
                } else {
                    item.style.opacity = '0.4';
                }
            });
            
            setTimeout(() => {
                items.forEach(item => {
                    item.classList.remove('playing');
                    item.style.opacity = '1';
                });
            }, 550);
        });
        
        document.getElementById('playChain').disabled = false;
        document.getElementById('stopPlayback').disabled = true;
        document.getElementById('chainDisplay').classList.remove('playing');
    }

    removeCustomConceptron(index) {
        const conceptron = this.customConceptrons[index];
        
        if (this.socket && this.roomId) {
            this.socket.emit('removeCustomConceptron', conceptron.id);
        } else {
            this.customConceptrons.splice(index, 1);
            this.renderDefaultConceptrons();
        }
    }

    generateGenome(text) {
        const result = document.getElementById('genomeResult');
        result.innerHTML = '';
        
        const genomeData = this.genome.convert(text);
        
        genomeData.forEach((item, index) => {
            const symbol = document.createElement('div');
            symbol.className = 'genome-symbol';
            symbol.style.animationDelay = `${index * 0.08}s`;
            
            const shape = this.createShapeSVG(item.shape, item.color);
            shape.classList.add('shape');
            symbol.appendChild(shape);
            
            const base = document.createElement('span');
            base.className = 'base';
            base.textContent = item.base;
            symbol.appendChild(base);
            
            result.appendChild(symbol);
        });
    }

    exportConceptrons() {
        const data = {
            version: '2.0',
            exportDate: new Date().toISOString(),
            conceptrons: [...this.defaultConceptrons, ...this.customConceptrons].map(c => c.toJSON())
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conceptrones-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Símbolos exportados', 'success');
    }

    importConceptrons(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.conceptrons && Array.isArray(data.conceptrons)) {
                    const imported = data.conceptrons.map(c => 
                        new Conceptron(c.c, c.f, c.t, c.n)
                    );
                    
                    this.customConceptrons = [...this.customConceptrons, ...imported];
                    this.renderDefaultConceptrons();
                    this.showToast(`${imported.length} símbolos importados`, 'success');
                }
            } catch (err) {
                this.showToast('Error al importar', 'error');
            }
        };
        reader.readAsText(file);
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new ConceptronApp();
});
