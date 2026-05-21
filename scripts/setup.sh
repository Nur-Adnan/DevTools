#!/usr/bin/env bash

# =========================================================================
# PULSEGUARD AUTOMATED ONBOARDING & DEV SETUP ENGINE (setup.sh)
# =========================================================================
# Sets up dependencies, environment configurations, databases, and caches.

set -euo pipefail

# ANSI color codes for rich terminal styling
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print banner
echo -e "${CYAN}"
echo "========================================================="
echo "   🛡️  WELCOME TO PULSEGUARD ONBOARDING SYSTEM  🛡️   "
echo "========================================================="
echo -e "${NC}"

# 1. Environment validation
echo -e "${BLUE}[1/5] Verifying System Requirements...${NC}"

# Check Node version
if ! command -v node &> /dev/null; then
  echo -e "${RED}Error: Node.js is not installed. Node.js v20+ is required.${NC}"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo -e "${YELLOW}Warning: Node.js version is $(node -v). Node.js v20+ is recommended.${NC}"
else
  echo -e "${GREEN}✓ Node.js $(node -v) is active.${NC}"
fi

# Check package manager (pnpm)
PM="pnpm"
if ! command -v pnpm &> /dev/null; then
  echo -e "${YELLOW}Warning: pnpm is not installed globally. Falling back to npx pnpm...${NC}"
  PM="npx pnpm"
else
  echo -e "${GREEN}✓ pnpm $(pnpm -v) detected.${NC}"
fi

# 2. Setup environment variables
echo -e "\n${BLUE}[2/5] Initializing Environment Variables...${NC}"
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
  echo -e "${GREEN}✓ Created default '.env' file from '.env.example'.${NC}"
elif [ -f ".env" ]; then
  echo -e "${GREEN}✓ '.env' file already exists. Skipping creation.${NC}"
else
  echo -e "${RED}Error: '.env.example' not found! Please check your monorepo integrity.${NC}"
  exit 1
fi

if [ ! -f ".env.local" ] && [ -f ".env.local.example" ]; then
  cp .env.local.example .env.local
  echo -e "${GREEN}✓ Created default '.env.local'.${NC}"
elif [ -f ".env.local" ] || [ -f "apps/web/.env.local" ]; then
  echo -e "${GREEN}✓ '.env.local' settings aligned.${NC}"
fi

# 3. Monorepo dependency installation
echo -e "\n${BLUE}[3/5] Resolving Monorepo Workspace Dependencies...${NC}"
$PM install --frozen-lockfile
echo -e "${GREEN}✓ Dependencies installed successfully.${NC}"

# 4. Database Setup & Prisma Generation
echo -e "\n${BLUE}[4/5] Syncing Database Schemas & Prisma Adapters...${NC}"
# Bypass t3-env checks during code generation/migrations
export SKIP_ENV_VALIDATION=true

echo -e "${CYAN}Generating Prisma Client...${NC}"
$PM --filter @pulseguard/db db:generate

# Try to run database migrations
if [ -z "${DATABASE_URL:-}" ]; then
  # Try to source DATABASE_URL from .env
  if [ -f ".env" ]; then
    DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d '"' -f 2 || true)
  fi
fi

if [ -n "${DATABASE_URL:-}" ] && [[ "${DATABASE_URL}" != *"username"* ]]; then
  echo -e "${CYAN}Applying schema migrations to remote/local PostgreSQL...${NC}"
  $PM --filter @pulseguard/db db:migrate || {
    echo -e "${YELLOW}Warning: Migration failed. Ensure PostgreSQL database is online and reachable.${NC}"
  }
else
  echo -e "${YELLOW}Warning: DATABASE_URL not set or default placeholder detected. Skipping schema push.${NC}"
fi

# 5. Git Hooks alignment
echo -e "\n${BLUE}[5/5] Aligning Git Hooks and Commit Checklists...${NC}"
if [ -d ".husky" ]; then
  chmod +x .husky/* || true
  echo -e "${GREEN}✓ Husky hook permissions successfully aligned (+x).${NC}"
else
  echo -e "${YELLOW}Warning: .husky folder not found. Skipping hook setup.${NC}"
fi

# Final Success Output
echo -e "\n${GREEN}========================================================="
echo "   🎉 SUCCESS: PULSEGUARD SYSTEM IS READY FOR USE!      "
echo "========================================================="
echo -e "${CYAN}"
echo "To launch local development engines:"
echo "   pnpm dev"
echo ""
echo "To execute our automated testing suite:"
echo "   pnpm test"
echo "========================================================="
echo -e "${NC}"
