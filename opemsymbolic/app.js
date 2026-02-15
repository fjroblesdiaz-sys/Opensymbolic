// OpenSymbolic - Conceptrón Communication MVP
// Audio Engine using Web Audio API

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.currentOscillator = null;
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
        
        // ADSR envelope for smoother sound
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05); // Attack
        gainNode.gain.linearRampToValueAtTime(0.3, now + duration * 0.5); // Decay
        gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release
        
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        return oscillator;
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
            
            this.playTone(conceptron.tone, 0.6);
            
            await new Promise(resolve => setTimeout(resolve, 700));
        }
        
        this.isPlaying = false;
    }

    stop() {
        this.isPlaying = false;
        if (this.currentOscillator) {
            try {
                this.currentOscillator.stop();
            } catch (e) {}
        }
    }
}

// Conceptrón Data Structure
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

// Genome Conceptrón - Convert text to symbolic DNA
class GenomeConverter {
    constructor() {
        // Map each letter/number to a base pair (A, C, G, T)
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

        // Numbers
        for (let i = 0; i <= 9; i++) {
            const letter = i.toString();
            this.baseMap[letter] = { 
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
                result.push({
                    char,
                    ...this.baseMap[char]
                });
            } else if (/[a-z]/.test(char)) {
                // Handle lowercase same as uppercase
                const upperChar = char.toUpperCase();
                if (this.baseMap[upperChar]) {
                    result.push({
                        char,
                        ...this.baseMap[upperChar]
                    });
                }
            }
        }
        
        return result;
    }
}

// Main Application
class ConceptronApp {
    constructor() {
        this.audio = new AudioEngine();
        this.genome = new GenomeConverter();
        this.chain = [];
        this.customConceptrons = [];
        
        // Default conceptrones for communication
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
            new Conceptron('#4ECDC4', 'square', 280, 'Baño')
        ];

        this.selectedColor = '#FF6B6B';
        this.selectedShape = 'circle';
        this.selectedTone = 440;

        this.init();
    }

    init() {
        this.renderDefaultConceptrons();
        this.bindEvents();
    }

    createShapeSVG(shape, color) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 40 40');
        svg.setAttribute('class', `shape ${shape}`);
        
        let element;
        
        switch(shape) {
            case 'circle':
                element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                element.setAttribute('cx', '20');
                element.setAttribute('cy', '20');
                element.setAttribute('r', '16');
                break;
            case 'triangle':
                element = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                element.setAttribute('points', '20,4 36,36 4,36');
                break;
            case 'square':
                element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                element.setAttribute('x', '6');
                element.setAttribute('y', '6');
                element.setAttribute('width', '28');
                element.setAttribute('height', '28');
                element.setAttribute('rx', '3');
                break;
            case 'hexagon':
                element = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                element.setAttribute('points', '20,2 37,11 37,29 20,38 3,29 3,11');
                break;
            case 'star':
                element = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                element.setAttribute('points', '20,2 24,16 38,16 27,25 32,38 20,30 8,38 13,25 2,16 16,16');
                break;
            case 'heart':
                element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                element.setAttribute('d', 'M20,36 C6,28 2,16 10,8 C14,4 20,7 20,7 C20,7 26,4 30,8 C38,16 34,28 20,36');
                break;
            default:
                element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                element.setAttribute('cx', '20');
                element.setAttribute('cy', '20');
                element.setAttribute('r', '16');
        }
        
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
            
            const shape = this.createShapeSVG(conceptron.shape, 'rgba(0,0,0,0.4)');
            shape.classList.add('shape');
            btn.appendChild(shape);

            const label = document.createElement('span');
            label.className = 'label';
            label.textContent = conceptron.name;
            btn.appendChild(label);

            // Add delete button for custom conceptrons
            if (index >= this.defaultConceptrons.length) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = '×';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.removeCustomConceptron(index - this.defaultConceptrons.length);
                };
                btn.appendChild(deleteBtn);
            }

            btn.onclick = () => this.addToChain(conceptron);
            grid.appendChild(btn);
        });
    }

    bindEvents() {
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
            this.audio.playTone(this.selectedTone, 0.5);
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
            
            this.customConceptrons.push(newConceptron);
            this.renderDefaultConceptrons();
            nameInput.value = '';
            
            // Success feedback
            const btn = document.getElementById('addConceptron');
            btn.textContent = '✓ Añadido!';
            btn.classList.add('success-animation');
            setTimeout(() => {
                btn.innerHTML = '<span class="btn-icon">+</span> Añadir al Tablero';
                btn.classList.remove('success-animation');
            }, 1000);
        };

        // Clear chain
        document.getElementById('clearChain').onclick = () => {
            this.chain = [];
            this.updateChainDisplay();
        };

        // Play chain
        document.getElementById('playChain').onclick = () => {
            this.playChain();
        };

        // Stop playback
        document.getElementById('stopPlayback').onclick = () => {
            this.audio.stop();
            document.getElementById('stopPlayback').disabled = true;
        };

        // Genome generator
        document.getElementById('generateGenome').onclick = () => {
            const input = document.getElementById('genomeInput');
            const text = input.value.trim();
            if (text) {
                this.generateGenome(text);
            }
        };

        // Enter key for genome
        document.getElementById('genomeInput').onkeypress = (e) => {
            if (e.key === 'Enter') {
                document.getElementById('generateGenome').click();
            }
        };
    }

    addToChain(conceptron) {
        if (this.chain.length >= 12) {
            alert('Máximo 12 símbolos en una cadena');
            return;
        }
        
        this.chain.push(conceptron);
        this.updateChainDisplay();
        
        // Play the tone
        this.audio.playTone(conceptron.tone, 0.4);
    }

    updateChainDisplay() {
        const display = document.getElementById('chainDisplay');
        
        if (this.chain.length === 0) {
            display.innerHTML = '<p class="placeholder-text">Toca los símbolos para crear tu mensaje</p>';
            document.getElementById('playChain').disabled = true;
        } else {
            display.innerHTML = '';
            this.chain.forEach((conceptron, index) => {
                const item = document.createElement('div');
                item.className = 'chain-item';
                item.style.backgroundColor = conceptron.color;
                
                const shape = this.createShapeSVG(conceptron.shape, 'rgba(0,0,0,0.5)');
                shape.classList.add('shape');
                item.appendChild(shape);
                
                const name = document.createElement('span');
                name.className = 'name';
                name.textContent = conceptron.name;
                item.appendChild(name);
                
                // Click to remove
                item.onclick = () => {
                    this.chain.splice(index, 1);
                    this.updateChainDisplay();
                };
                
                display.appendChild(item);
            });
            
            document.getElementById('playChain').disabled = false;
        }
        
        document.getElementById('chainLength').textContent = this.chain.length;
    }

    async playChain() {
        if (this.chain.length === 0) return;
        
        document.getElementById('playChain').disabled = true;
        document.getElementById('stopPlayback').disabled = false;
        
        await this.audio.playSequence(this.chain, (conceptron, index) => {
            // Visual feedback
            const items = document.querySelectorAll('.chain-item');
            items.forEach((item, i) => {
                if (i === index) {
                    item.style.transform = 'scale(1.2)';
                    item.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
                } else {
                    item.style.opacity = '0.5';
                }
            });
            
            setTimeout(() => {
                items.forEach(item => {
                    item.style.transform = '';
                    item.style.boxShadow = '';
                    item.style.opacity = '1';
                });
            }, 600);
        });
        
        document.getElementById('playChain').disabled = false;
        document.getElementById('stopPlayback').disabled = true;
    }

    removeCustomConceptron(index) {
        this.customConceptrons.splice(index, 1);
        this.renderDefaultConceptrons();
    }

    generateGenome(text) {
        const result = document.getElementById('genomeResult');
        result.innerHTML = '';
        
        const genomeData = this.genome.convert(text);
        
        genomeData.forEach((item, index) => {
            const symbol = document.createElement('div');
            symbol.className = 'genome-symbol';
            symbol.style.animationDelay = `${index * 0.1}s`;
            
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
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ConceptronApp();
});
