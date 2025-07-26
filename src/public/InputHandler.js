class InputHandler {
    constructor() {
        this.keys = {
            up: false,
            down: false
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'ArrowUp':
                    this.keys.up = true;
                    event.preventDefault();
                    break;
                case 'ArrowDown':
                    this.keys.down = true;
                    event.preventDefault();
                    break;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            switch(event.code) {
                case 'ArrowUp':
                    this.keys.up = false;
                    event.preventDefault();
                    break;
                case 'ArrowDown':
                    this.keys.down = false;
                    event.preventDefault();
                    break;
            }
        });
    }
    
    getInputState() {
        return {
            up: this.keys.up,
            down: this.keys.down
        };
    }
}