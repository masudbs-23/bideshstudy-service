# Education Consultancy Platform - Backend API

A production-ready Node.js backend API for an Education Consultancy Platform where students can apply for abroad studies.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with OTP verification, role-based access control
- **Student Management**: Complete profile management with document uploads
- **Institution Management**: CRUD operations for institutions with search and filtering
- **Application System**: Students can apply to institutions and track application status
- **Event Management**: Admin can create events, students can book them
- **Real-time Chat**: Socket.io powered chat between students and admins
- **Admin Dashboard**: Analytics, statistics, and management tools

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Cloudinary account (for file uploads)
- SMTP email service (Gmail, SendGrid, etc.)

## 🛠️ Installation

1. Clone the repository
```bash
git clone <repository-url>
cd admission-service
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
   - MongoDB connection string
   - JWT secrets
   - SMTP credentials
   - Cloudinary credentials
   - Frontend URL

5. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

## 📁 Project Structure

```
admission-service/
├── config/           # Configuration files
│   ├── database.js
│   ├── cloudinary.js
│   └── email.js
├── controllers/      # Business logic
│   ├── authController.js
│   ├── studentController.js
│   ├── institutionController.js
│   ├── applicationController.js
│   ├── eventController.js
│   ├── chatController.js
│   └── adminController.js
├── middleware/       # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   └── rateLimiter.js
├── models/           # Mongoose models
│   ├── User.js
│   ├── Document.js
│   ├── Institution.js
│   ├── Application.js
│   ├── Event.js
│   ├── EventBooking.js
│   ├── ChatConversation.js
│   ├── Message.js
│   └── OTP.js
├── routes/           # API routes
│   ├── authRoutes.js
│   ├── studentRoutes.js
│   ├── institutionRoutes.js
│   ├── applicationRoutes.js
│   ├── eventRoutes.js
│   ├── chatRoutes.js
│   └── adminRoutes.js
├── services/         # External services
│   └── socketService.js
├── utils/            # Utility functions
│   ├── statusCode.js
│   ├── validators.js
│   └── generateTokens.js
├── server.js          # Main server file
├── package.json
└── .env.example
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Student Routes
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update profile
- `POST /api/students/upload-documents` - Upload document
- `GET /api/students/documents` - Get all documents
- `DELETE /api/students/documents/:id` - Delete document
- `PUT /api/students/update-education` - Update education details

### Institution Routes
- `GET /api/institutions` - Get all institutions (paginated)
- `GET /api/institutions/:id` - Get institution by ID
- `GET /api/institutions/search` - Search institutions
- `POST /api/institutions` - Create institution (Admin)
- `PUT /api/institutions/:id` - Update institution (Admin)
- `DELETE /api/institutions/:id` - Delete institution (Admin)

### Application Routes
- `POST /api/applications/apply` - Apply to institution
- `GET /api/applications/my-applications` - Get my applications
- `GET /api/applications/:id` - Get application by ID
- `PUT /api/applications/:id/status` - Update application status (Admin)
- `GET /api/applications` - Get all applications (Admin)

### Event Routes
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events/:id/book` - Book event
- `GET /api/events/my-bookings` - Get my bookings
- `POST /api/events` - Create event (Admin)
- `PUT /api/events/:id` - Update event (Admin)
- `DELETE /api/events/:id` - Delete event (Admin)

### Chat Routes
- `GET /api/chat/conversations` - Get conversations
- `GET /api/chat/messages/:conversationId` - Get messages
- `POST /api/chat/send` - Send message
- `GET /api/chat/admin/conversations` - Get all conversations (Admin)

### Admin Routes
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/applications` - Get all applications
- `GET /api/admin/analytics` - Get analytics data

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ] // Optional validation errors
}
```

## 🧪 Testing

API endpoints can be tested using tools like Postman, Insomnia, or curl.

Example:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","mobile":"1234567890","password":"password123"}'
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on auth routes
- Input validation and sanitization
- Helmet.js security headers
- CORS configuration
- XSS protection

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **joi** - Validation
- **nodemailer** - Email service
- **socket.io** - Real-time communication
- **cloudinary** - File upload service
- **multer** - File upload middleware
- **helmet** - Security headers
- **cors** - CORS middleware
- **morgan** - HTTP request logger

## 🚀 Deployment

1. Set `NODE_ENV=production` in `.env`
2. Update all environment variables for production
3. Use a process manager like PM2
4. Set up MongoDB Atlas or production MongoDB
5. Configure reverse proxy (Nginx)
6. Enable HTTPS

## 📄 License

ISC

## 👥 Support

For issues and questions, please open an issue in the repository.


