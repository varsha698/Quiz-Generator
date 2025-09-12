# QuizMaster - AI-Powered Quiz Platform 🧠✨

A comprehensive, modern quiz application built with Angular 17+ that leverages AI to generate quizzes from text and uploaded files. Features include real-time OCR, file upload processing, advanced timer functionality, and Progressive Web App (PWA) capabilities.

## 🚀 Features

### Core Functionality
- **AI-Powered Quiz Generation**: Generate quizzes from text input using advanced AI
- **File Upload Support**: Upload PDFs and images to create quizzes automatically
- **Real OCR Processing**: Extract text from images using Tesseract.js
- **Smart Content Analysis**: Intelligent content processing for realistic quiz generation
- **Advanced Timer System**: Real-time countdown with pause/resume functionality
- **Progressive Web App**: Installable app with offline support

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Progress**: Visual progress indicators and status updates
- **Personal Stats Dashboard**: Track your quiz performance and achievements
- **Modern UI**: Clean, intuitive interface with Material Design components
- **Offline Support**: Continue using the app without internet connection

### Technical Features
- **Angular 17+**: Latest Angular framework with standalone components
- **TypeScript**: Full type safety and modern JavaScript features
- **RxJS**: Reactive programming for state management
- **MongoDB**: Robust data storage with Mongoose ODM
- **RESTful API**: Clean, scalable backend architecture
- **Service Workers**: Advanced caching and offline functionality

## 🛠️ Technology Stack

### Frontend
- **Angular 17+** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming
- **Angular Material** - UI components
- **Tesseract.js** - OCR processing
- **PWA** - Progressive Web App features

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - Object Data Modeling
- **JWT** - Authentication

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/varsha698/Quiz-Generator.git
   cd Quiz-Generator
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Create environment file
   cp src/environments/environment.ts.example src/environments/environment.ts
   
   # Add your API keys
   # GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Start MongoDB**
   ```bash
   # Using the provided script
   ./start-mongodb.sh
   
   # Or manually
   mongod --dbpath /path/to/your/db
   ```

5. **Start the application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start
   
   # Terminal 2 - Frontend
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:4000

## 🎯 Usage

### Creating Quizzes

1. **Text Input Mode**
   - Navigate to "Quiz Generator"
   - Select "Text Input" mode
   - Paste your content
   - Click "Generate Quiz with AI"

2. **File Upload Mode**
   - Select "File Upload" mode
   - Drag and drop files or click "Browse Files"
   - Supported formats: PDF, JPG, PNG, GIF, BMP, WEBP
   - Watch real-time processing progress
   - Click "Generate Quiz with AI"

### Taking Quizzes

1. **Select a Quiz**
   - Go to "Take Quiz"
   - Browse available quizzes
   - Click "Select First" then "Take Quiz"

2. **Timer Features**
   - Automatic countdown for timed quizzes
   - Pause/Resume functionality
   - Visual progress indicators
   - Auto-submission when time expires

3. **Submit and Review**
   - Answer all questions
   - Click "Submit Quiz"
   - View your score and performance
   - Share your results

### Personal Dashboard

1. **View Stats**
   - Go to "Leaderboard" (Your Stats)
   - See your total points and quizzes
   - Track your level and achievements

2. **Achievements**
   - Unlock badges for various accomplishments
   - Track progress toward goals
   - View your quiz history

## 🔧 Configuration

### API Keys
The application requires a Groq API key for AI quiz generation:

1. Get your API key from [Groq Console](https://console.groq.com/)
2. Add it to your environment file:
   ```typescript
   export const environment = {
     production: false,
     groqApiKey: 'your_api_key_here'
   };
   ```

### Database Configuration
MongoDB connection is configured in `backend/server.js`:
```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizmaster';
```

## 📱 PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Continue using without internet
- **Push Notifications**: Get notified of quiz updates
- **Background Sync**: Sync data when connection is restored

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e

# Run tests with coverage
npm run test:coverage
```

## 📊 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Bundle Size**: Optimized for fast loading
- **Lazy Loading**: Components loaded on demand
- **Caching**: Intelligent caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Angular Team** - For the amazing framework
- **Groq** - For AI capabilities
- **Tesseract.js** - For OCR functionality
- **Material Design** - For UI components

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/varsha698/Quiz-Generator/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

## 🎉 Demo

Try the live demo at: [QuizMaster Demo](https://your-demo-url.com)

---

**Built with ❤️ using Angular 17+ and modern web technologies**