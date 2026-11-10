# Runtime-only image. Compile dist with Node 24 before assembling this context.
FROM node:24-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node dist ./dist
COPY --chown=node:node assets ./assets
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
