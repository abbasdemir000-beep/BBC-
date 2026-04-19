# Firebase Integration Guide

This guide explains how to set up and configure Firebase for the AI Knowledge Marketplace.

## Prerequisites

- Google account
- Firebase project created in [Firebase Console](https://console.firebase.google.com/)
- Node.js and npm installed

## Firebase Project Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Create a project**
3. Enter project name (e.g., "AI Knowledge Marketplace")
4. Follow the setup wizard
5. Enable Google Analytics (optional)

### 2. Enable Required Services

#### Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable the following sign-in methods:
   - Email/Password
   - Google (optional)
   - GitHub (optional)

#### Firestore Database

1. Go to **Firestore Database**
2. Click **Create Database**
3. Choose **Start in production mode** or **Start in test mode**
4. Select your region (closest to your users)

#### Cloud Storage

1. Go to **Storage**
2. Click **Get Started**
3. Set security rules (see Security Rules section below)
4. Choose your region

### 3. Get Firebase Credentials

1. Go to **Project Settings** (gear icon)
2. Click **Service Accounts** tab
3. Click **Generate New Private Key** (for server-side operations)
4. Go to **General** tab
5. Copy your Web App credentials

## Environment Variables

Add the following to your `.env.local` file:

```env
# Firebase Client Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Server Configuration (Secret)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key_with_escaped_newlines
```

## Database Schema

### Firestore Collections

#### users
```
{
  uid: string (document ID)
  email: string
  displayName: string
  photoURL: string
  role: 'user' | 'expert' | 'admin'
  reputation: number
  bio: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### consultations
```
{
  id: string (document ID)
  title: string
  description: string
  imageUrl: string
  userId: string
  domainId: string
  status: 'pending' | 'active' | 'completed'
  prizePoints: number
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### submissions
```
{
  id: string (document ID)
  consultationId: string
  expertId: string
  content: string
  submittedAt: timestamp
  scores: {
    accuracy: number
    reasoning: number
    completeness: number
    clarity: number
  }
  status: 'submitted' | 'evaluating' | 'evaluated'
}
```

#### messages
```
{
  id: string (document ID)
  roomId: string
  senderId: string
  content: string
  timestamp: timestamp
  read: boolean
}
```

## Security Rules

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth.uid == userId || request.auth.uid != null;
      allow write: if request.auth.uid == userId;
    }

    // Consultations collection
    match /consultations/{consultationId} {
      allow read: if resource.data.isPublic == true || request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid != null;
      allow update: if request.auth.uid == resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId;
    }

    // Submissions collection
    match /submissions/{submissionId} {
      allow read: if request.auth.uid == resource.data.expertId || request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == resource.data.expertId;
      allow update: if request.auth.uid == resource.data.expertId;
    }

    // Messages collection
    match /messages/{messageId} {
      allow read: if request.auth.uid == resource.data.senderId || request.auth.uid == resource.data.recipientId;
      allow create: if request.auth.uid == request.resource.data.senderId;
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Cloud Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }

    // Allow public read access to consultation images
    match /consultations/{consultationId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid != null;
    }

    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Usage Examples

### Authentication

```typescript
import { registerUser, loginUser, logoutUser } from '@/lib/firebase/auth';

// Register
const user = await registerUser('user@example.com', 'password123');

// Login
const user = await loginUser('user@example.com', 'password123');

// Logout
await logoutUser();
```

### Firestore

```typescript
import { 
  getDocument, 
  setDocument, 
  updateDocument, 
  queryDocuments 
} from '@/lib/firebase/firestore';

// Get document
const user = await getDocument('users', 'userId');

// Set document
await setDocument('users', 'userId', { email: 'user@example.com' });

// Update document
await updateDocument('users', 'userId', { reputation: 100 });

// Query documents
const experts = await queryDocuments('users', 'role', '==', 'expert');
```

### Storage

```typescript
import { uploadFile, deleteFile, getFileUrl } from '@/lib/firebase/storage';

// Upload file
const url = await uploadFile(file, 'consultations/image.jpg');

// Get file URL
const url = await getFileUrl('consultations/image.jpg');

// Delete file
await deleteFile('consultations/image.jpg');
```

## Monitoring

### Firebase Console

- **Authentication**: Monitor sign-ups and active users
- **Firestore**: Check database usage and performance
- **Storage**: Monitor file uploads and bandwidth
- **Functions**: View logs and performance metrics

### Recommended Tools

- Firebase Admin SDK for server-side operations
- Firebase Emulator Suite for local development
- Cloud Logging for debugging

## Troubleshooting

### Authentication Issues

- Verify email/password authentication is enabled
- Check security rules allow user creation
- Ensure environment variables are correctly set

### Firestore Connection Issues

- Verify Firestore database is created
- Check security rules allow read/write operations
- Ensure database region is accessible

### Storage Upload Issues

- Check file size limits (default 5GB)
- Verify storage bucket permissions
- Ensure CORS is properly configured

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Cloud Storage Documentation](https://firebase.google.com/docs/storage)
