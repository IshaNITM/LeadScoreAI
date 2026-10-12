#!/usr/bin/env bash

# ==============================================================================
# LeadScore AI - Run Script
# Starts both the backend API server and frontend client concurrently.
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Text styles
BOLD="\033[1m"
GREEN="\033[32m"
BLUE="\033[34m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

echo -e "${BOLD}${CYAN}"
echo "=========================================================="
echo "   🚀 Starting LeadScore AI Workspace"
echo "   Caprae Capital - AI Lead Qualification Engine"
echo "=========================================================="
echo -e "${RESET}"

# 1. Check Node.js and npm
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed. Please install Node.js 18+ to proceed.${RESET}"
    exit 1
fi

echo -e "${BLUE}▶ Checking dependencies...${RESET}"

if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}Installing server dependencies...${RESET}"
    npm --prefix server install
fi

if [ ! -d "client/node_modules" ]; then
    echo -e "${YELLOW}Installing client dependencies...${RESET}"
    npm --prefix client install
fi

echo -e "${GREEN}✔ Dependencies verified.${RESET}\n"

# 2. Cleanup handler on exit (Ctrl+C)
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${RESET}"
    if [ -n "$SERVER_PID" ]; then
        kill "$SERVER_PID" 2>/dev/null || true
    fi
    if [ -n "$CLIENT_PID" ]; then
        kill "$CLIENT_PID" 2>/dev/null || true
    fi
    echo -e "${GREEN}✔ Cleaned up. Exiting.${RESET}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 3. Start Backend Server
echo -e "${BLUE}▶ Launching Backend API server (Port 3001)...${RESET}"
npm --prefix server run dev &
SERVER_PID=$!

# Wait briefly for server startup
sleep 2

# 4. Start Frontend Client
echo -e "${BLUE}▶ Launching Frontend UI (Port 5173)...${RESET}"
npm --prefix client run dev &
CLIENT_PID=$!

echo -e "\n${BOLD}${GREEN}==========================================================${RESET}"
echo -e "${BOLD}${GREEN}   ✔ All services are running!${RESET}"
echo -e "   🌐 Frontend Workspace: ${CYAN}http://localhost:5173${RESET}"
echo -e "   🔌 Backend API:        ${CYAN}http://localhost:3001/api/health${RESET}"
echo -e "   💡 Press ${BOLD}Ctrl+C${RESET} anytime to stop both services."
echo -e "${BOLD}${GREEN}==========================================================${RESET}\n"

# Keep the script active and wait for background processes
wait
