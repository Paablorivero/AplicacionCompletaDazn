# ⚽ Fantasy League

![Angular](https://img.shields.io/badge/Angular-v20-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![daisyUI](https://img.shields.io/badge/daisyUI-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white)

Proyecto Intermodular de una Liga Fantasy completa, abarcando desde el modelado de la Base de Datos hasta el desarrollo del Backend y Frontend.

> **⚠️ Nota de arquitectura:** Este proyecto está dividido en dos repositorios para separar las responsabilidades del cliente y del servidor:
> - 🖥️ **[Repositorio Frontend (FantasyLeagueFront)](https://github.com/Paablorivero/FantasyLeagueFront)**
> - ⚙️ **[Repositorio Backend (FantasyLeagueBack)](https://github.com/Paablorivero/FantasyLeagueBack)**

---

## 📋 Índice
1. [Descripción](#-descripción)
2. [Tecnologías](#-tecnologías)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Instalación y Configuración](#-instalación-y-configuración)
5. [API Externa](#-api-externa)

---

## 📖 Descripción

Desarrollo de una **aplicación académica** simulando un **entorno profesional**.

El proyecto consiste en una **Liga Fantasy de fútbol**, cuyo objetivo es crear una interfaz moderna y responsive, válida tanto para **PC como dispositivos móviles**.

La aplicación consume una **API de fútbol**, orientada a **La Liga Española**, y cuenta con un **backend propio** encargado de gestionar la base de datos y actuar como intermediario seguro entre el frontend y la API externa.

---

## 🛠️ Tecnologías

### Frontend (FantasyLeagueFront)
- **Framework:** Angular v20
- **Lenguaje:** TypeScript
- **Estilos:** TailwindCSS, HTML5 / CSS3
- **Componentes UI:** daisyUI (Plugin de Tailwind para componentes pre-diseñados ágiles y accesibles)

### Backend (FantasyLeagueBack)
- **Entorno/Framework:** Node.js
- **Lenguaje:** TypeScript

### Base de Datos
- **Motor:** PostgreSQL

### Herramientas
- npm / pnpm / yarn
- Git / GitHub

---

## 📂 Estructura del Proyecto

A continuación se detalla la organización de los directorios en ambos repositorios:

### 🖥️ Repositorio Frontend (`FantasyLeagueFront`)
```text
📦 FantasyLeagueFront
 ┣ 📂 APIKey/               # Información, pruebas o configuración de las claves para la API de fútbol externa.
 ┣ 📂 FLFront/              # Código fuente de la aplicación Frontend en Angular.
 ┣ 📂 Proyecto/DiagramasBD/ # Esquemas y diagramas del modelado de la Base de Datos (E-R, Relacional, etc).
 ┣ 📂 ScriptSQL/            # Scripts (.sql) para la creación, inserción y mantenimiento de la BD PostgreSQL.
 ┣ 📜 .gitignore            # Archivos y directorios ignorados por Git.
 ┗ 📜 README.md             # Documentación principal.

📦 FantasyLeagueBack
 ┣ 📂 .idea/                # Archivos de configuración del IDE (ej: WebStorm/IntelliJ).
 ┣ 📂 LFBack/               # Código fuente principal de la API / Backend en TypeScript.
 ┗ 📜 README.md             # Documentación principal.
