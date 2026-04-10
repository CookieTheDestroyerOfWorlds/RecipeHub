# AGENTS.md

## Project Overview

This repository contains **RecipeHub**, a full-stack multi-platform recipe sharing application built for a capstone assignment.

The project must include:

- a **Next.js** web application
- a **Next.js backend API**
- a **React Native mobile app with Expo**
- a **Neon PostgreSQL** database using **Drizzle ORM**
- **JWT authentication**
- **role-based authorization**
- optional **Cloudflare R2** file/image uploads
- live deployment on the Internet
- documentation and clean GitHub commit history

The application follows a **client-server architecture**:
- the **Next.js app** contains both the **web frontend** and the **REST API backend**
- the **Expo app** is a separate mobile client
- both clients communicate with the backend over **REST HTTP APIs**

---

## Project Goal

Build a production-style recipe sharing platform where:

### Regular users can:
- register
- log in / log out
- browse recipes
- search and filter recipes
- view recipe details
- create recipes
- edit their own recipes
- delete their own recipes
- upload recipe images
- comment on recipes
- favorite recipes
- manage their own profile

### Admin users can:
- access an admin dashboard
- view users
- manage roles
- delete inappropriate recipes
- delete inappropriate comments
- moderate platform content

---

## Required Tech Stack

### Monorepo
Use a Node.js monorepo structure.

Preferred:
- `pnpm` workspaces

Optional:
- `Turborepo`

### Web app and backend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Next.js Route Handlers for REST APIs

### Database
- Neon serverless PostgreSQL
- Drizzle ORM
- Drizzle Kit migrations

### Mobile app
- React Native
- Expo
- TypeScript

### Authentication
- JWT-based authentication
- password hashing with `bcryptjs`
- JWT signing/verification with `jose` or `jsonwebtoken`

### Validation and forms
- Zod
- React Hook Form

### Storage
- Cloudflare R2 for recipe images and user-uploaded files

### Deployment
- deploy web/backend in a serverless environment
- mobile app should consume the deployed API base URL

---

## Monorepo Structure

Use this structure unless there is a strong reason to change it:

```txt
/apps
  /web        -> Next.js web app + backend API
  /mobile     -> Expo React Native app
/packages
  /shared     -> shared types, constants, utility functions
/drizzle      -> migration files if kept at root, otherwise inside apps/web
AGENTS.md
README.md
package.json
pnpm-workspace.yaml
