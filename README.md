# EnaZeda

Safety platform for women in Tunisia to report street harassment, visualize danger zones, walk safely with community support, and access verified safe spaces.

## Project Overview

EnaZeda is a mobile-first, responsive platform built to help women in Tunisia navigate safely through public spaces. The platform uses real accounts, trusted reporting, and secure infrastructure to build a scalable public safety network.

## Technologies

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- React Router
- React Query

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd enazeda.tn

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

## Features

- **Multi-language Support**: English, French, and Arabic with RTL support
- **Theme Toggle**: Dark and light mode
- **Anonymous Reporting**: Report street harassment incidents anonymously
- **Safety Heatmap**: Visualize danger zones across Tunisian cities
- **Walk With Me**: Share live location with trusted contacts
- **Verified Safe Spaces**: Find community-verified safe locations
- **Mobile-First**: Optimized for low data usage and fast performance

## Project Structure

```
enazeda.tn/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (Auth, Language, Theme)
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   └── lib/            # Utility functions
```

## Building for Production

```sh
npm run build
```

## License

All rights reserved.
