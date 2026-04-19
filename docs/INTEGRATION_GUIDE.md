# Firebase & Cloudflare Integration Guide

This document provides a comprehensive overview of integrating Firebase and Cloudflare with the AI Knowledge Marketplace.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Pages                         │
│  (Hosting, CDN, DDoS Protection, SSL/TLS)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Firebase   │  │  PostgreSQL  │  │   Cloudflare │
│   Auth       │  │  Database    │  │   Workers    │
└──────────────┘  └──────────────┘  └──────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Firestore  │  │   Storage    │  │   Analytics  │
│   Database   │  │   (Images)   │  │   & Logging  │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Component Breakdown

### 1. Cloudflare Pages

**Purpose**: Hosting and edge computing

**Features**:
- Automatic deployments from GitHub
- Global CDN for fast content delivery
- Built-in SSL/TLS encryption
- DDoS protection
- Serverless functions via Workers

**Configuration**:
- See `wrangler.toml` for configuration
- See `docs/CLOUDFLARE_SETUP.md` for detailed setup

### 2. Firebase Authentication

**Purpose**: User authentication and management

**Features**:
- Email/password authentication
- Social login (Google, GitHub, etc.)
- User profile management
- Session management
- Security rules enforcement

**Usage**:
```typescript
import { loginUser, registerUser } from '@/lib/firebase/auth';

const user = await loginUser('user@example.com', 'password');
```

### 3. Firestore Database

**Purpose**: NoSQL database for real-time data

**Features**:
- Real-time data synchronization
- Scalable NoSQL database
- Built-in security rules
- Offline support
- Automatic backups

**Collections**:
- `users` - User profiles and metadata
- `consultations` - Questions/problems
- `submissions` - Expert answers
- `messages` - Chat messages
- `reviews` - User reviews

**Usage**:
```typescript
import { getDocument, setDocument } from '@/lib/firebase/firestore';

const user = await getDocument('users', 'userId');
await setDocument('consultations', 'id', { title: 'Question' });
```

### 4. Cloud Storage

**Purpose**: File storage for images and documents

**Features**:
- Scalable object storage
- CDN integration
- Security rules
- Automatic compression

**Usage**:
```typescript
import { uploadFile, getFileUrl } from '@/lib/firebase/storage';

const url = await uploadFile(file, 'consultations/image.jpg');
```

### 5. PostgreSQL Database

**Purpose**: Primary relational database

**Features**:
- Structured data storage
- ACID compliance
- Complex queries
- Transaction support

**Usage**:
- Managed via Prisma ORM
- Connection via `DATABASE_URL`

### 6. Cloudflare Workers

**Purpose**: Serverless edge computing

**Features**:
- Request/response middleware
- Custom authentication
- Rate limiting
- Request transformation

**Configuration**:
- See `wrangler.toml`
- Create custom workers in `src/workers/`

## Integration Workflow

### User Registration Flow

```
1. User submits registration form
   ↓
2. Client calls Firebase Auth API
   ↓
3. Firebase creates user account
   ↓
4. Client calls /api/auth/register
   ↓
5. Server creates Prisma User record
   ↓
6. Server creates Firestore user document
   ↓
7. JWT token generated and returned
   ↓
8. User logged in
```

### Consultation Submission Flow

```
1. User submits consultation with image
   ↓
2. Image uploaded to Firebase Storage
   ↓
3. Consultation created in Firestore
   ↓
4. Consultation also created in PostgreSQL (Prisma)
   ↓
5. AI analysis triggered
   ↓
6. Results stored in both databases
   ↓
7. Experts notified via Firestore
```

### Expert Submission Flow

```
1. Expert submits answer
   ↓
2. Submission stored in Firestore
   ↓
3. Submission also stored in PostgreSQL
   ↓
4. AI evaluation triggered
   ↓
5. Anti-fraud checks performed
   ↓
6. Results updated in both databases
   ↓
7. User notified
```

## Environment Variables

### Client-Side (NEXT_PUBLIC_*)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Server-Side (Secret)

```env
DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET=your_jwt_secret
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

## Deployment Checklist

- [ ] Firebase project created and configured
- [ ] Firestore database created with security rules
- [ ] Cloud Storage bucket created with security rules
- [ ] Firebase credentials added to environment variables
- [ ] PostgreSQL database provisioned
- [ ] Cloudflare Pages connected to GitHub
- [ ] Build settings configured
- [ ] Environment variables added to Cloudflare
- [ ] Domain configured (optional)
- [ ] SSL/TLS certificate enabled
- [ ] Monitoring and logging configured
- [ ] Backup strategy implemented

## Performance Optimization

### Caching Strategy

- Static assets: 1 year cache
- API responses: 5 minutes cache
- User data: No cache (real-time)
- Images: Cloudflare Image Optimization

### Database Optimization

- Index frequently queried fields
- Use pagination for large datasets
- Implement query caching
- Monitor database performance

### Frontend Optimization

- Code splitting
- Lazy loading
- Image optimization
- Service workers for offline support

## Security Best Practices

### Authentication

- Use strong passwords
- Enable 2FA for admin accounts
- Rotate JWT secrets regularly
- Use HTTPS only

### Database

- Enable encryption at rest
- Use security rules to restrict access
- Regular backups
- Monitor access logs

### Storage

- Validate file types and sizes
- Use signed URLs for sensitive files
- Enable versioning
- Regular backups

### API

- Implement rate limiting
- Validate all inputs
- Use CORS properly
- Monitor for suspicious activity

## Troubleshooting

### Common Issues

1. **Firebase initialization fails**
   - Check environment variables
   - Verify Firebase project settings
   - Check browser console for errors

2. **Database connection fails**
   - Verify DATABASE_URL
   - Check network connectivity
   - Verify credentials

3. **Deployment fails**
   - Check build logs
   - Verify all environment variables
   - Check Node.js version compatibility

4. **Performance issues**
   - Check database query performance
   - Monitor API response times
   - Check Cloudflare analytics

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloudflare Pages Guide](https://developers.cloudflare.com/pages/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review Firebase and Cloudflare documentation
3. Check application logs
4. Contact support team

## Version History

- **v1.0.0** - Initial Firebase and Cloudflare integration
  - Firebase Auth, Firestore, Storage
  - Cloudflare Pages deployment
  - PostgreSQL integration
