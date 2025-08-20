# Deployment Guide for InvDues Reminder Backend

This backend can be deployed to either Render or Heroku. Both are excellent platforms for Node.js applications.

## Option 1: Deploy to Render (Recommended - Free Tier Available)

### Prerequisites
- GitHub repository with your code
- Render account (free at render.com)

### Steps:
1. Push your code to GitHub
2. Go to Render dashboard
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: invdues-reminder-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

### Environment Variables:
Set these in Render dashboard under "Environment":

```
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_access_secret
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_EMAIL_CLIENT_ID=your_google_email_client_id
GOOGLE_EMAIL_CLIENT_SECRET=your_google_email_client_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
ZAPIER_CLIENT_ID=your_zapier_client_id
ZAPIER_CLIENT_SECRET=your_zapier_client_secret
ZAPIER_WEBHOOK_URL=your_zapier_webhook_url
AUTHORIZED_REDIRECT_URIS=your_authorized_redirect_uris
ENCRYPTION_KEY=your_32_byte_hex_encryption_key
FRONTEND_URL=https://invdues-reminder.vercel.app
```

## Option 2: Deploy to Heroku

### Prerequisites
- Heroku CLI installed
- Heroku account
- Git repository

### Steps:
1. Install Heroku CLI
2. Login to Heroku: `heroku login`
3. Create a new app: `heroku create invdues-reminder-backend`
4. Set environment variables (see below)
5. Deploy: `git push heroku main`

### Environment Variables for Heroku:
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongodb_connection_string
heroku config:set ACCESS_TOKEN_SECRET=your_jwt_access_secret
heroku config:set REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
heroku config:set GOOGLE_CLIENT_ID=your_google_client_id
heroku config:set GOOGLE_CLIENT_SECRET=your_google_client_secret
heroku config:set GOOGLE_EMAIL_CLIENT_ID=your_google_email_client_id
heroku config:set GOOGLE_EMAIL_CLIENT_SECRET=your_google_email_client_secret
heroku config:set RAZORPAY_KEY_ID=your_razorpay_key_id
heroku config:set RAZORPAY_KEY_SECRET=your_razorpay_key_secret
heroku config:set RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
heroku config:set ZAPIER_CLIENT_ID=your_zapier_client_id
heroku config:set ZAPIER_CLIENT_SECRET=your_zapier_client_secret
heroku config:set ZAPIER_WEBHOOK_URL=your_zapier_webhook_url
heroku config:set AUTHORIZED_REDIRECT_URIS=your_authorized_redirect_uris
heroku config:set ENCRYPTION_KEY=your_32_byte_hex_encryption_key
heroku config:set FRONTEND_URL=https://invdues-reminder.vercel.app
```

## Post-Deployment

### 1. Update Frontend Configuration
Update your frontend's API base URL to point to your new backend:

**For Render**: `https://invdues-reminder-backend.onrender.com`
**For Heroku**: `https://invdues-reminder-backend.herokuapp.com`

### 2. Update Google OAuth Settings
In Google Cloud Console, update your OAuth redirect URIs:
- Add: `https://your-backend-url.com/auth/google/callback`
- Add: `https://your-backend-url.com/oauth/google/callback`

### 3. Update CORS Settings
The backend is already configured with proper CORS settings for your frontend URL.

### 4. Test Your Deployment
- Visit your backend URL to see the welcome message
- Test authentication endpoints
- Test API endpoints from your frontend

## Environment Variables Details

### Required Variables:
- **MONGO_URI**: Your MongoDB connection string
- **ACCESS_TOKEN_SECRET**: JWT secret for access tokens (generate a random 64-character string)
- **REFRESH_TOKEN_SECRET**: JWT secret for refresh tokens (generate a random 64-character string)
- **ENCRYPTION_KEY**: 32-byte hex string for encrypting sensitive data
- **FRONTEND_URL**: Your frontend URL for CORS

### Optional Variables:
- **GOOGLE_CLIENT_ID/SECRET**: For Google OAuth authentication
- **GOOGLE_EMAIL_CLIENT_ID/SECRET**: For sending emails via Gmail API
- **RAZORPAY_***: For payment processing
- **ZAPIER_***: For Zapier integration

## Notes

1. **Scheduler**: The reminder scheduler will automatically start with your application
2. **Database**: Make sure your MongoDB database is accessible from the hosting platform
3. **CORS**: Already configured for your frontend domain
4. **Environment**: All environment variables should be set as described above
5. **SSL**: Both Render and Heroku provide HTTPS by default

## Troubleshooting

1. **Application not starting**: Check logs for missing environment variables
2. **CORS errors**: Verify FRONTEND_URL is set correctly
3. **Database connection**: Ensure MONGO_URI is correct and database is accessible
4. **OAuth not working**: Update redirect URIs in Google Cloud Console
