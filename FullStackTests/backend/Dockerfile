# Usamos una imagen ligera de Node 20
FROM node:20-alpine

# Establecemos el directorio de trabajo dentro del contenedor
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 1. Copiamos los package.json primero para aprovechar la caché de Docker
COPY package*.json ./
COPY tsconfig.json ./

# 2. Instalamos las dependencias
RUN npm install

# 3. Copiamos todo el código fuente del backend
COPY . .

# 4. Compilamos el código TypeScript a JavaScript (carpeta dist/)
RUN npm run build

# 5. Exponemos el puerto donde escucha tu API
EXPOSE 3000

# 6. Comando de arranque
# Asegúrate de que en tu package.json tienes un script "start" que ejecute: "node dist/index.js" o similar
CMD ["npm", "start"]