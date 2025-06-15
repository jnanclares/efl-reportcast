# EFL ReportCast

EFL ReportCast es una aplicación web desarrollada para EFL Global que permite a los usuarios acceder a reportes de manera segura. La aplicación implementa un sistema de autenticación utilizando Supabase, permitiendo a los usuarios registrarse y acceder con sus correos corporativos.

## Objetivos del Proyecto

- Proporcionar una plataforma segura para el acceso a reportes de EFL Global
- Implementar un sistema de autenticación con Supabase
- Permitir el registro y acceso con correos corporativos
- Ofrecer funcionalidades de recuperación y cambio de contraseña

## Características Principales

- 🔐 Autenticación segura con Supabase
- 📧 Registro y acceso con correos corporativos
- 🔑 Recuperación y cambio de contraseña
- 🎨 Interfaz moderna y responsiva

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)
- Cuenta de Supabase (para la configuración del backend)

## Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd efl_reportcast
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```
   REACT_APP_SUPABASE_URL=tu_url_de_supabase
   REACT_APP_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm start
   ```

5. **Acceder a la aplicación:**
   Abre tu navegador y visita [http://localhost:3000](http://localhost:3000)

## Tecnologías Utilizadas

- React.js
- Supabase (Autenticación)
- React Router
- Tailwind CSS
- Node.js

## Licencia

Este proyecto es propiedad de EFL Global y su uso está restringido a los términos y condiciones establecidos por la empresa.

## Contacto

Para más información o soporte, contacta al equipo de desarrollo de EFL Global.
