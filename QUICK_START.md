# Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env` and fill in all required values:
- MongoDB connection string
- JWT secrets (generate strong random strings)
- SMTP email credentials
- Cloudinary credentials
- Frontend URL

### 3. Start MongoDB
Make sure MongoDB is running on your system or use MongoDB Atlas.

### 4. Run the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in .env).

## 📝 First Steps

### Create an Admin User

You'll need to create an admin user manually in MongoDB or through the API:

1. Register a user via `/api/auth/register`
2. Verify OTP via `/api/auth/verify-otp`
3. Update the user's role to 'admin' in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Test the API

1. **Health Check**
```bash
curl http://localhost:5000/health
```

2. **Register a Student**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "1234567890",
    "password": "password123"
  }'
```

3. **Verify OTP** (Check your email for OTP)
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

## 🔑 Important Notes

1. **JWT Tokens**: Access tokens expire in 7 days, refresh tokens in 30 days (configurable in .env)

2. **File Uploads**: Documents are uploaded to Cloudinary. Make sure your Cloudinary account is configured.

3. **Email Service**: OTP and notifications are sent via SMTP. Configure your email service in .env.

4. **Socket.io**: Real-time chat requires WebSocket connection. Connect to the same server URL.

5. **Rate Limiting**: Auth routes have stricter rate limits (5 requests per 15 minutes).

## 📚 API Documentation

See `README.md` for complete API endpoint documentation.

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running
- Verify MONGODB_URI in .env
- Check network/firewall settings

### Email Not Sending
- Verify SMTP credentials
- Check spam folder
- For Gmail, use App Password (not regular password)

### Cloudinary Upload Fails
- Verify Cloudinary credentials
- Check file size limits (10MB for documents, 5MB for images)
- Verify file types are allowed

### JWT Token Errors
- Ensure JWT_SECRET and JWT_REFRESH_SECRET are set
- Check token expiration
- Verify token format in Authorization header: `Bearer <token>`

## 🔒 Security Checklist

- [ ] Change all default secrets in .env
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly for production
- [ ] Set up rate limiting appropriately
- [ ] Use environment-specific .env files
- [ ] Never commit .env to version control

## 📦 Production Deployment

1. Set `NODE_ENV=production`
2. Use a process manager (PM2 recommended)
3. Set up reverse proxy (Nginx)
4. Enable HTTPS/SSL
5. Configure MongoDB Atlas or production MongoDB
6. Set up monitoring and logging
7. Configure backup strategy

## 🆘 Support

For issues, check:
1. Server logs for error messages
2. MongoDB connection status
3. Environment variables are set correctly
4. All dependencies are installed

