FROM node:18

# Instalar Git LFS
RUN apt-get update && apt-get install -y git-lfs
RUN git lfs install

# Instalar dependencias
WORKDIR /app
COPY package*.json ./
RUN npm install

# Copiar archivos (incluyendo JSON de Git LFS)
COPY . .

# Exponer puerto
EXPOSE 3000

# Iniciar servidor
CMD ["node", "server.js"]
