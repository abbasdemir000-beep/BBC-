# Cloudflare Integration Guide

This guide explains how to deploy and configure the AI Knowledge Marketplace on Cloudflare Pages and Workers.

## Prerequisites

- Cloudflare account with Pages enabled
- Wrangler CLI installed (`npm install -g wrangler`)
- GitHub repository connected to Cloudflare

## Deployment Steps

### 1. Connect GitHub Repository

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** > **Create a project**
3. Select **Connect to Git**
4. Authorize and select the `abbasdemir000-beep/BBC-` repository
5. Click **Begin setup**

### 2. Configure Build Settings

Set the following build configuration:

- **Framework preset**: Next.js
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `/` (or leave blank)

### 3. Environment Variables

Add the following environment variables in Cloudflare Pages settings:

**Public Variables (NEXT_PUBLIC_*):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Secret Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Your JWT secret key
- `FIREBASE_PROJECT_ID` - Firebase project ID (server-side)
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email
- `FIREBASE_PRIVATE_KEY` - Firebase private key (with escaped newlines)

### 4. Deploy

Once configured, Cloudflare will automatically deploy on every push to your main branch.

## Cloudflare Workers (Optional)

For advanced use cases, you can use Cloudflare Workers for:

- Custom middleware
- Request/response transformation
- Rate limiting
- Custom authentication

### Example Worker Script

Create a `src/workers/auth.ts` file:

```typescript
export default {
  async fetch(request: Request): Promise<Response> {
    // Add custom authentication logic
    const token = request.headers.get('Authorization');
    
    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    return fetch(request);
  },
};
```

## Performance Optimization

### Caching Strategy

Add caching headers to `next.config.js`:

```javascript
const nextConfig = {
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=120',
          },
        ],
      },
    ];
  },
};
```

### Image Optimization

Cloudflare Image Optimization is automatically enabled. Configure in `next.config.js`:

```javascript
const nextConfig = {
  images: {
    loader: 'cloudflare',
    loaderFile: './image-loader.ts',
  },
};
```

## Database Connection

The app uses PostgreSQL. For Cloudflare deployment:

1. Use a PostgreSQL provider (Neon, Supabase, Railway, etc.)
2. Set `DATABASE_URL` in Cloudflare environment variables
3. Ensure the database is accessible from Cloudflare's IP range

## Troubleshooting

### Build Fails

- Check build logs in Cloudflare Dashboard
- Ensure all environment variables are set
- Verify Node.js version compatibility

### Database Connection Issues

- Test the connection string locally
- Check firewall rules on your database provider
- Verify credentials in environment variables

### Firebase Integration Issues

- Ensure Firebase credentials are correctly set
- Check Firebase project permissions
- Verify CORS settings in Firebase console

## Monitoring

Monitor your deployment using:

- Cloudflare Analytics Dashboard
- Cloudflare Workers Analytics (if using Workers)
- Application Performance Monitoring (APM) tools

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
