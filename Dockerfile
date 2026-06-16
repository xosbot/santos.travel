# ============================================================================
# IVA Cortex — Production Docker Image
# ============================================================================
FROM node:22-slim

# Install PostgreSQL client + Puppeteer dependencies
RUN apt-get update -qq && apt-get install -y -qq \
  postgresql-client-16 \
  chromium \
  libnss3 libnspr4 libatk-bridge2.0-0 libdrm2 libxkbcommon0 \
  libgbm1 libasound2 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Create PDF output directory
RUN mkdir -p pdf_output

# Puppeteer config for container
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 3000

CMD ["node", "src/server.js"]
