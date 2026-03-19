# FLFront - Interfaz de Liga Fantasy

FLFront es una aplicación web moderna para gestionar y participar en ligas de deportes fantasy. Desarrollada con Angular, Tailwind CSS y DaisyUI, ofrece una interfaz ágil e intuitiva para los aficionados al deporte.

## Características

- **Página de Inicio (Landing Page)**: Información sobre la plataforma y cómo unirse.
- **Autenticación de Usuarios**: Funcionalidades de inicio de sesión y registro.
- **Panel de Control (Home)**: Vista general de las actividades y actualizaciones del usuario.
- **Gestión de Ligas**: Explorar, unirse y ver diversas ligas deportivas.
- **Paneles de Liga**:
  - **Clasificación**: Seguimiento de tu posición en la liga.
  - **Mercado**: Compra, venta y gestión de jugadores para tu equipo.
  - **Noticias**: Mantente al día con las últimas novedades de los deportes y de la liga.
  - **Plantilla**: Gestión de los jugadores y la alineación de tu equipo.
- **Configuración de Usuario**: Personaliza tu perfil y preferencias de la aplicación.
- **Gestión de Errores**: Páginas 404 personalizadas para una mejor experiencia de usuario.

## Tecnologías Utilizadas

- **Framework**: [Angular](https://angular.dev/) (v21.1.2)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) y [DaisyUI](https://daisyui.com/)
- **Pruebas (Testing)**: [Vitest](https://vitest.dev/)
- **Lenguaje**: TypeScript

## Desarrollo

### Prerrequisitos

- Node.js (v20+ recomendado)
- npm (v10+ recomendado)

### Instalación

```bash
npm install
```

### Servidor de desarrollo

Para iniciar un servidor de desarrollo local, ejecuta:

```bash
npm start
```

Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente cada vez que modifiques algún archivo fuente.

### Compilación (Build)

Para compilar el proyecto para producción:

```bash
npm run build
```

Los archivos resultantes se guardarán en el directorio `dist/`.

### Ejecutar Pruebas

Para ejecutar las pruebas unitarias con Vitest:

```bash
npm test
```

## Estructura del Proyecto

- `src/app/Pages`: Contiene los componentes principales de las vistas (Inicio, Liga, Mercado, etc.).
- `src/app/Components`: Componentes de UI reutilizables (Barra de navegación, Pie de página, etc.).
- `public/`: Recursos estáticos (imágenes, iconos, etc.).

---

*Este proyecto fue generado con [Angular CLI](https://github.com/angular/angular-cli) versión 21.1.2.*
