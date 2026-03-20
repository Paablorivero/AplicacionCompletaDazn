# Usamos Node.js como base
FROM node:20-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos package.json e instalamos dependencias
COPY package*.json ./
RUN npm install

# Copiamos todo el código fuente del proyecto Angular
COPY . .

# Exponemos el puerto por defecto de Angular
EXPOSE 4200

# Comando para arrancar el servidor de Angular
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]