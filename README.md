# Task & Team Manager Frontend

A modern, feature-rich task management and team collaboration application built with React and Vite. This frontend application provides role-based access control, project management, task tracking, and team member management capabilities.

## Overview

Task & Team Manager is a comprehensive frontend solution for managing projects, tasks, and team members. It features:

- **Authentication & Authorization**: Secure login/register with role-based access control (Admin, Manager, Team Lead, User)
- **Dashboard**: Overview of projects, tasks, and team statistics
- **Project Management**: Create, view, edit, and manage projects
- **Task Management**: Create, assign, track, and complete tasks
- **User Management**: Admin functionality to manage team members and roles
- **Responsive Design**: Mobile-friendly UI built with Material-UI and Tailwind CSS

## Tech Stack

### Core Framework

- **React 19.2.6** - UI library for building user interfaces
- **Vite 8.0.12** - Next-generation frontend tooling and build tool

### State Management & Forms

- **Redux Toolkit 2.12.0** - Predictable state management
- **React-Redux 9.3.0** - Redux bindings for React
- **React Hook Form 7.76.0** - Performant form management
- **Zod 4.4.3** - TypeScript-first schema validation

### UI & Styling

- **Material-UI 9.0.1** - Comprehensive component library
- **Emotion** - CSS-in-JS styling solution
- **Tailwind CSS 3.4.19** - Utility-first CSS framework
- **Recharts 3.8.1** - Charting library for data visualization

### Routing & Navigation

- **React Router DOM 6.30.3** - Client-side routing

### Development Tools

- **ESLint** - Code quality and style enforcement
- **PostCSS** - CSS transformation tool
- **Autoprefixer** - Vendor prefix auto-completion

## Project Structure

```
src/
├── api/                 # API service configurations
├── assets/              # Images, fonts, and static assets
├── components/
│   ├── layout/          # Layout components (MainLayout, Navbar, Sidebar)
│   └── common/          # Reusable components (ProtectedRoute, LoadingSpinner, etc.)
├── pages/               # Page components (Dashboard, Users, Projects, Tasks, etc.)
├── services/            # API service modules
├── store/               # Redux store configuration and slices
├── utils/               # Utility functions and constants
├── App.jsx              # Root application component
├── main.jsx             # Application entry point
└── index.css            # Global styles
```

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/singhsourav01/Task-Manager-Frontend.git
   cd Task-Manager-Frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your API endpoint and other configuration:

   ```
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## Available Scripts

### Development

```bash
npm run dev
```

Starts the development server with hot module replacement (HMR) enabled. Changes are reflected instantly in the browser.

### Build

```bash
npm run build
```

Creates an optimized production build in the `dist/` directory.

### Preview

```bash
npm run preview
```

Locally preview the production build before deployment.

### Linting

```bash
npm run lint
```

Run ESLint to check code quality and style compliance.

## Features

### Authentication

- User login and registration
- Session management
- Secure token-based authentication
- Role-based access control

### Dashboard

- Overview of active projects and tasks
- Task statistics and metrics
- Team member information

### Project Management

- Create and manage projects
- View project details and tasks
- Edit and update project information
- Track project progress

### Task Management

- Create new tasks with descriptions and assignments
- Assign tasks to team members
- Track task status (To Do, In Progress, Done, etc.)
- View task details and history
- Filter and search tasks

### User Management (Admin Only)

- View all team members
- Create new users
- Edit user information and roles
- Manage user permissions

### Responsive Design

- Mobile, tablet, and desktop optimized layouts
- Material-UI components for consistent design
- Tailwind CSS for custom styling

## Routing Structure

| Route                | Access     | Component     | Description             |
| -------------------- | ---------- | ------------- | ----------------------- |
| `/login`             | Public     | Login         | User login page         |
| `/register`          | Public     | Register      | User registration page  |
| `/dashboard`         | Protected  | Dashboard     | Main dashboard overview |
| `/projects`          | Protected  | Projects      | Projects list           |
| `/projects/new`      | Protected  | ProjectForm   | Create new project      |
| `/projects/:id`      | Protected  | ProjectDetail | View project details    |
| `/projects/:id/edit` | Protected  | ProjectForm   | Edit project            |
| `/tasks`             | Protected  | Tasks         | Tasks list              |
| `/tasks/new`         | Protected  | TaskForm      | Create new task         |
| `/tasks/:id`         | Protected  | TaskDetail    | View task details       |
| `/tasks/:id/edit`    | Protected  | TaskForm      | Edit task               |
| `/users`             | Admin Only | Users         | Users management        |
| `/users/new`         | Admin Only | UserForm      | Create new user         |
| `/users/:id/edit`    | Admin Only | UserForm      | Edit user               |
| `/access-denied`     | Protected  | AccessDenied  | Access denied page      |

## Role-Based Access Control

The application implements role-based access control with the following roles:

- **Admin**: Full access to all features including user management
- **Manager**: Can manage projects and assign tasks
- **Team Lead**: Can manage team tasks and view team progress
- **User**: Can view and update assigned tasks

## API Integration

The application communicates with a backend API. Ensure the backend server is running on the configured API URL (see environment variables).

API Base URL is configured in `.env`:

```
VITE_API_URL=http://localhost:3000/api
```

## State Management

Redux Toolkit is used for state management with the following slices:

- **authSlice**: Manages authentication state (user, token, roles)
- Additional slices for projects, tasks, and users

## Build Configuration

### Vite Configuration

Configured for React with fast refresh support. See `vite.config.js` for details.

### Tailwind CSS

Custom Tailwind configuration in `tailwind.config.js` with theme customizations.

### ESLint

Code quality rules configured in `eslint.config.js`.

## Development Guidelines

### Code Style

- Use ES6+ features
- Follow ESLint rules
- Use functional components with hooks
- Component names should be PascalCase
- File names should match component names

### Forms

- Use React Hook Form for all form handling
- Validate with Zod schemas
- Provide clear error messages

### API Calls

- Use services module for API interactions
- Handle errors gracefully
- Show loading states
- Display user feedback for actions

### Styling

- Prefer Tailwind CSS classes
- Use Material-UI components for common patterns
- Keep custom CSS minimal
- Maintain responsive design principles

## Deployment

### Production Build

```bash
npm run build
```

### Environment Variables for Production

Update `.env` with production API URL:

```
VITE_API_URL=https://api.yourdomain.com/api
```

### Deployment Platforms

Can be deployed to:

- Vercel
- Netlify
- GitHub Pages
- Traditional web servers (nginx, Apache)

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically use the next available port.

### API Connection Issues

- Verify the backend server is running
- Check `VITE_API_URL` in `.env`
- Check browser console for CORS errors

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf dist`
- Rebuild: `npm run build`

## Contributing

When contributing to this project:

1. Follow the code style guidelines
2. Run `npm run lint` before committing
3. Test changes thoroughly
4. Update documentation if needed

## License

This project is part of the Task Management System.

## Support

For issues or questions, please refer to the project documentation or contact the development team.
