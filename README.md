# EFL ReportCast

EFL ReportCast is a web application developed for EFL Global that allows users to securely access reports. The application implements an authentication system using Supabase, enabling users to register and access with their corporate emails.

## Project Objectives

- Provide a secure platform for accessing EFL Global reports
- Implement an authentication system with Supabase
- Allow registration and access with corporate emails
- Offer password recovery and change functionalities

## Main Features

- 🔐 Secure authentication with Supabase
- 📧 Registration and access with corporate emails
- 🔑 Password recovery and change
- 🎨 Modern and responsive interface

## Prerequisites

- Node.js (version 14 or higher)
- npm (included with Node.js)
- Supabase account (for backend configuration)

## Installation and Configuration

1. **Clone the repository:**
   ```bash
   git clone [REPOSITORY_URL]
   cd efl_reportcast
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the project root with the following variables:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Access the application:**
   Open your browser and visit [http://localhost:3000](http://localhost:3000)

## Technologies Used

- React.js
- Supabase (Authentication)
- React Router
- Tailwind CSS
- Node.js

## License

This project is property of EFL Global and its use is restricted to the terms and conditions established by the company.

## Contact

For more information or support, contact the EFL Global development team.
