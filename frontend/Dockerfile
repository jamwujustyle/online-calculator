FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Re-run npm install at startup to pick up any new packages
# from the volume-mounted package.json
CMD sh -c "npm install --silent && npm run dev -- --host"
