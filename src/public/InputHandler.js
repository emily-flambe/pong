/**
 * InputHandler Class - 4-Paddle Input Management
 * 
 * Handles keyboard input for 4-paddle Pong with simultaneous paddle pair control.
 * Arrow keys control paddle pairs: Up/Down for left/right paddles, Left/Right for top/bottom paddles.
 * WASD provides alternative responsive controls.
 * Designed to be easily redirected for network play - returns clean input state
 * instead of directly modifying game objects.
 */
class InputHandler {
    constructor() {
        // Track current key states for 4-directional movement
        this.keys = {
            // Vertical movement (controls left and right paddles simultaneously)
            up: false,
            down: false,
            // Horizontal movement (controls top and bottom paddles simultaneously)
            left: false,
            right: false,
            // WASD alternative controls
            w: false,
            s: false,
            a: false,
            d: false
        };

        // Bind event handlers to maintain 'this' context
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        // Set up keyboard event listeners
        this.setupEventListeners();
    }

    /**
     * Set up keyboard event listeners for 4-directional controls
     * Listens for arrow keys and WASD for comprehensive paddle control
     */
    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    /**
     * Handle keydown events for 4-directional control
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyDown(event) {
        switch(event.code) {
            // Arrow key controls
            case 'ArrowUp':
                this.keys.up = true;
                event.preventDefault(); // Prevent page scrolling
                break;
            case 'ArrowDown':
                this.keys.down = true;
                event.preventDefault(); // Prevent page scrolling
                break;
            case 'ArrowLeft':
                this.keys.left = true;
                event.preventDefault(); // Prevent page scrolling
                break;
            case 'ArrowRight':
                this.keys.right = true;
                event.preventDefault(); // Prevent page scrolling
                break;
            // WASD alternative controls
            case 'KeyW':
                this.keys.w = true;
                event.preventDefault();
                break;
            case 'KeyS':
                this.keys.s = true;
                event.preventDefault();
                break;
            case 'KeyA':
                this.keys.a = true;
                event.preventDefault();
                break;
            case 'KeyD':
                this.keys.d = true;
                event.preventDefault();
                break;
        }
    }

    /**
     * Handle keyup events for 4-directional control
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyUp(event) {
        switch(event.code) {
            // Arrow key controls
            case 'ArrowUp':
                this.keys.up = false;
                event.preventDefault();
                break;
            case 'ArrowDown':
                this.keys.down = false;
                event.preventDefault();
                break;
            case 'ArrowLeft':
                this.keys.left = false;
                event.preventDefault();
                break;
            case 'ArrowRight':
                this.keys.right = false;
                event.preventDefault();
                break;
            // WASD alternative controls
            case 'KeyW':
                this.keys.w = false;
                event.preventDefault();
                break;
            case 'KeyS':
                this.keys.s = false;
                event.preventDefault();
                break;
            case 'KeyA':
                this.keys.a = false;
                event.preventDefault();
                break;
            case 'KeyD':
                this.keys.d = false;
                event.preventDefault();
                break;
        }
    }

    /**
     * Get current input state for 4-paddle control - Network-ready design
     * Returns a clean, serializable object that can be sent over network
     * or used locally by GameState.update()
     * 
     * Combines arrow keys and WASD inputs to determine movement direction:
     * - Vertical: -1 for up, 1 for down, 0 for none (controls left/right paddles)
     * - Horizontal: -1 for left, 1 for right, 0 for none (controls top/bottom paddles)
     * 
     * @returns {Object} Current input state with vertical and horizontal movement
     */
    getInputState() {
        // Calculate vertical movement (up/down for left and right paddles)
        let vertical = 0;
        if (this.keys.up || this.keys.w) {
            vertical = -1; // Up movement
        } else if (this.keys.down || this.keys.s) {
            vertical = 1;  // Down movement
        }

        // Calculate horizontal movement (left/right for top and bottom paddles)
        let horizontal = 0;
        if (this.keys.left || this.keys.a) {
            horizontal = -1; // Left movement
        } else if (this.keys.right || this.keys.d) {
            horizontal = 1;  // Right movement
        }

        return {
            vertical: vertical,
            horizontal: horizontal,
            timestamp: performance.now() // For network sync timing
        };
    }

    /**
     * Clean up event listeners (for multiplayer transition or cleanup)
     * Removes keyboard event listeners to prevent conflicts
     */
    cleanup() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    /**
     * FUTURE MULTIPLAYER EXTENSION POINT
     * When transitioning to multiplayer, this method can be overridden
     * to send input to server instead of returning local state
     * 
     * Example multiplayer override:
     * getInputState() {
     *     const inputState = { vertical: this.vertical, horizontal: this.horizontal };
     *     this.networkManager.sendInput(inputState);
     *     return inputState; // Return for immediate local prediction
     * }
     */

    /**
     * FUTURE: Server input injection for multiplayer
     * Allows server to override local input state for authoritative gameplay
     * 
     * @param {Object} serverInputState - Input state from server with vertical/horizontal
     */
    setServerInputState(serverInputState) {
        // Future implementation for server-authoritative input
        // Can directly apply server state or convert to key states as needed
        // this.serverState = { ...serverInputState };
    }
}