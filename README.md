# Form Builder Application

A modern form builder application built with Next.js, TypeScript, and Firebase.

## Features

- Create and customize forms with various field types
- Drag-and-drop form field reordering
- Form validation and submission handling
- Real-time form preview
- Form response collection and management

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Firebase account and project

## Environment Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database in your Firebase project
3. Create a new web app in your Firebase project
4. Copy your Firebase configuration from the Firebase Console
5. Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

Replace the placeholder values with your actual Firebase configuration values.

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-form-builder
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
my-form-builder/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # Utility functions and configurations
│   ├── types/              # TypeScript type definitions
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
├── .env.local             # Environment variables (not in git)
└── package.json           # Project dependencies and scripts
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Security Notes

- Never commit `.env.local` to version control
- Keep your Firebase configuration secure
- Use Firebase Security Rules to protect your data
- Consider implementing user authentication for form creators

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
