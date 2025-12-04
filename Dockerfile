# ----------------- BUILD STAGE ------------------
FROM node:22.20.0 AS builder

WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .
RUN npx prisma generate

# ----------------- RUN STAGE ------------------
FROM node:22.20.0

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app ./

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]