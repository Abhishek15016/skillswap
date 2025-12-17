# Skill Swap Platform

A modern web application  where users can exchange skills by sending and accepting swap requests, with real-time chat functionality after a request is accepted. The platform includes an admin dashboard for managing users and requests.

## 🚀 Live Demo

The application allows users to:
- Create profiles and showcase their skills
- Discover other users with complementary skills
- Send and accept skill swap requests
- Chat with accepted swap partners
- Admin dashboard for platform management

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - Modern UI library
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons
- **Context API** - State management

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Lightweight database
- **JWT** - JSON Web Token authentication
- **Werkzeug** - Password hashing and utilities
- **Flask-CORS** - Cross-origin resource sharing

### Development Tools
- **Node.js** - JavaScript runtime
- **npm** - Package manager
- **Python 3.8+** - Python runtime
- **pip** - Python package manager

## 📁 Project Structure

```
Skill Swap/
├── client/                     # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   └── Navbar.js
│   │   ├── context/           # Global state management
│   │   │   └── AuthContext.js
│   │   ├── pages/             # Page components
│   │   │   ├── AdminDashboard.js
│   │   │   ├── Chat.js
│   │   │   ├── ChatList.js
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Profile.js
│   │   │   ├── Register.js
│   │   │   ├── Requests.js
│   │   │   └── Users.js
│   │   ├── services/          # API service functions
│   │   │   ├── authService.js
│   │   │   ├── chatService.js
│   │   │   ├── requestService.js
│   │   │   └── userService.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
├── server/                     # Flask backend
│   ├── app/
│   │   ├── routes/            # API route handlers
│   │   │   ├── admin.py
│   │   │   ├── auth.py
│   │   │   ├── chat.py
│   │   │   ├── requests.py
│   │   │   └── users.py
│   │   ├── utils/             # Utility functions
│   │   │   └── auth.py
│   │   ├── models.py          # Database models
│   │   └── __init__.py
│   ├── uploads/               # File uploads directory
│   ├── app.py                 # Main Flask application
│   ├── config.py              # Configuration settings
│   └── requirements.txt       # Python dependencies
├── instance/                   # Database files
├── add-sample-users.py        # Sample data script
├── create-admin.py            # Admin user creation script
├── start-server.py            # Server startup script
└── README.md
```

## 🚀 Quick Start Guide

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Abhishek15016/skillswap.git
cd Skill-Swap
```

### Step 2: Backend Setup

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Initialize the database (creates SQLite database)
python -c "from app import create_app; app = create_app(); app.app_context().push(); from app.models import db; db.create_all()"

# Create admin user
python ../create-admin.py

# Start the Flask server
python app.py
```

The backend will be running at `http://localhost:5000`

### Step 3: Frontend Setup

Open a new terminal window:

```bash
# Navigate to client directory
cd client

# Install Node.js dependencies
npm install

# Start the React development server
npm start
```

The frontend will be running at `http://localhost:3000`

### Step 4: Access the Application

1. Open your browser and go to `http://localhost:3000`
2. Register a new account or use the admin account:
   - **Email**: `admin@skillswap.com`
   - **Password**: `admin123`

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables (set in `server/config.py`):

```python
SECRET_KEY = 'your-secret-key'
SQLALCHEMY_DATABASE_URI = 'sqlite:///skill_swap.db'
UPLOAD_FOLDER = 'uploads'
MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB file limit
```

### Database

The application uses SQLite database with the following tables:
- `users` - User profiles and authentication
- `swap_requests` - Skill swap requests
- `chat_rooms` - Chat rooms for accepted requests
- `messages` - Chat messages

## 📋 Features

### User Features
- **Authentication**: Secure login/register with JWT tokens
- **Profile Management**: Create and edit profiles with skills
- **User Discovery**: Search and browse other users by skills
- **Skill Swapping**: Send and accept skill exchange requests
- **Real-time Chat**: Communicate with accepted swap partners
- **File Uploads**: Upload profile photos
- **Responsive Design**: Works on desktop and mobile devices

### Admin Features
- **Dashboard**: Overview of platform statistics
- **User Management**: View, ban, and unban users
- **Request Management**: Monitor and delete swap requests
- **Analytics**: View platform success rates and user activity

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users` - Get all public users
- `GET /api/users/:id` - Get specific user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/photo` - Upload profile photo
- `GET /api/users/search` - Search users by skills

### Swap Requests
- `GET /api/requests` - Get user's requests
- `POST /api/requests` - Create new swap request
- `PUT /api/requests/:id` - Update request status
- `DELETE /api/requests/:id` - Delete request

### Chat
- `GET /api/chat/:roomId` - Get chat messages
- `POST /api/chat/:roomId` - Send message
- `GET /api/chat/room/:requestId` - Get chat room for request

### Admin (Admin only)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/ban` - Ban/unban user
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/requests` - Get all requests
- `DELETE /api/admin/requests/:id` - Delete any request

## 🎨 UI/UX Features

- **Modern Design**: Clean, responsive interface using Tailwind CSS
- **Dark/Light Mode**: Automatic theme detection
- **Interactive Elements**: Hover effects, transitions, and animations
- **Mobile Responsive**: Optimized for all screen sizes
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time input validation

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **Protected Routes**: Role-based access control
- **Input Validation**: Server-side data validation
- **File Upload Security**: Type and size restrictions
- **CORS Protection**: Cross-origin request handling

## 🚀 Deployment

### Backend Deployment (Heroku/Similar)

```bash
# Install gunicorn for production
pip install gunicorn

# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Deploy to your preferred platform
```

### Frontend Deployment (Netlify/Vercel)

```bash
# Build for production
npm run build

# Deploy the build folder to your preferred platform
```

## 🧪 Testing

### Backend Testing
```bash
cd server
python -m pytest
```

### Frontend Testing
```bash
cd client
npm test
```

## 📝 Scripts

### Create Admin User
```bash
python create-admin.py
```

### Add Sample Users
```bash
python add-sample-users.py
```

### Start Server
```bash
python start-server.py
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Ensure all dependencies are installed
3. Verify database is properly initialized
4. Check that both frontend and backend are running
5. Open an issue on GitHub with detailed error information

## 🔄 Updates

- **v1.0.0**: Initial release with basic functionality
- **v1.1.0**: Added admin dashboard and improved UI
- **v1.2.0**: Enhanced security and performance optimizations

---

**Made with ❤️ using React, Flask, and SQLite** 
#   s k i l l s w a p 
 
 
