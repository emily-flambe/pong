# Pong Game Makefile
# Commands for building and deploying the Pong game

.PHONY: deploy dev clean help

# Deploy to Cloudflare Workers
deploy:
	npx wrangler deploy --env=""

# Start development server
dev:
	npx wrangler dev

# Clean build artifacts
clean:
	rm -rf .wrangler/

# Show help
help:
	@echo "Available commands:"
	@echo "  make deploy  - Deploy to Cloudflare Workers"
	@echo "  make dev     - Start development server"
	@echo "  make clean   - Clean build artifacts"
	@echo "  make help    - Show this help message"

# Default target
.DEFAULT_GOAL := help