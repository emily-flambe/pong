/**
 * InputHandler Class - Network-Ready Input Management
 * 
 * Handles keyboard input for the Pong game with multiplayer extensibility.
 * Designed to be easily redirected for network play - returns clean input state
 * instead of directly modifying game objects.
 */
class InputHandler {
    constructor() {
        // Track current key states
        this.keys = {
            up: false,
            down: false
        };

        // Bind event handlers to maintain 'this' context
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        // Set up keyboard event listeners
        this.setupEventListeners();
    }

    /**
     * Set up keyboard event listeners for arrow keys
     * Only listens for up/down arrows as specified in requirements
     */
    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    /**
     * Handle keydown events
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyDown(event) {
        switch(event.code) {
            case 'ArrowUp':
                this.keys.up = true;
                event.preventDefault(); // Prevent page scrolling
                break;
            case 'ArrowDown':
                this.keys.down = true;
                event.preventDefault(); // Prevent page scrolling
                break;
        }
    }

    /**
     * Handle keyup events
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyUp(event) {
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
    }

    /**
     * Get current input state - Network-ready design
     * Returns a clean, serializable object that can be sent over network
     * or used locally by GameState.update()
     * 
     * @returns {Object} Current input state
     */
    getInputState() {
        return {
            up: this.keys.up,
            down: this.keys.down,
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
     *     const inputState = { up: this.keys.up, down: this.keys.down };
     *     this.networkManager.sendInput(inputState);
     *     return inputState; // Return for immediate local prediction
     * }
     */

    /**
     * FUTURE: Server input injection for multiplayer
     * Allows server to override local input state for authoritative gameplay
     * 
     * @param {Object} serverInputState - Input state from server
     */
    setServerInputState(serverInputState) {
        // Future implementation for server-authoritative input
        // this.keys = { ...serverInputState };
    }
}