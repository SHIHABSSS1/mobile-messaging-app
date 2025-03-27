# Mobile Messaging App

A mobile-friendly messaging website with features including image sharing, audio calls, and message unsending capabilities.

## Features

- **Authentication**: User registration and login
- **Real-time Messaging**: Send and receive messages in real-time
- **Image Sharing**: Share images in conversations
- **Unsend Messages**: Remove messages from both sides of the conversation
- **Audio Calls**: Make audio calls to your contacts
- **Mobile Responsive**: Fully optimized for mobile devices
- **Dark/Light Mode**: Theme toggle for user preference

## Technologies Used

- React with TypeScript
- Firebase (Authentication, Firestore, Storage)
- Chakra UI for styling
- WebRTC for audio calls

## Getting Started

### Prerequisites

- Node.js and npm installed
- Firebase account

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd message
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up Firebase

   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password), Firestore Database, and Storage
   - Copy your Firebase configuration from Project Settings
   - You can run our setup script to configure Firebase automatically:
     ```
     npm run setup
     ```
   - Or manually update the `firebaseConfig` object in `src/firebase/config.ts` with your project details

4. Start the development server
   ```
   npm start
   ```

## Firebase Security Rules

This project includes security rules for Firestore and Storage. You can deploy them using the Firebase CLI:

```
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## Usage

1. Register a new account or login
2. Search for users to start chatting
3. Send messages, share images, or start audio calls
4. Unsend messages by selecting the message and clicking "Unsend"

## Mobile Optimization

The app is optimized for mobile devices with:
- Responsive layout that adapts to different screen sizes
- Touch-friendly UI elements
- Efficient performance for mobile networks
- Dark/light mode for different lighting conditions

## Deployment

### Firebase Deployment

To deploy the application to Firebase:

```
npm run deploy
```

Or manually:

```
npm run build
firebase deploy
```

### Render Deployment

To deploy the application to Render:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Create a new Web Service in Render dashboard
3. Connect your repository
4. Select "Static Site" as the environment
5. Set the build command to: `npm run deploy:render`
6. Set the publish directory to: `build`
7. Click "Create Web Service"

**Important:** After deploying to Render, add your Render domain (e.g., `your-app-name.onrender.com`) to Firebase Authentication > Settings > Authorized domains.

## License

This project is licensed under the MIT License. 