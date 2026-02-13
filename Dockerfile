FROM node:22.12.0-bullseye-slim

WORKDIR /app

# Install dependencies (including dev deps temporarily for prisma generate)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client (safe to run only if prisma config exists)
RUN if [ -f ./prisma/schema.prisma ]; then npx prisma generate; fi

# Remove dev dependencies to keep image small
RUN npm prune --production

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "index.js"]
