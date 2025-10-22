# 🌾 CropPredict - AI-Powered Crop Yield Estimator

A modern, interactive web application that uses artificial intelligence to predict crop yields and provide agricultural recommendations for Indian farmers.

## ✨ Features

### 🚀 **Core Functionality**
- **AI-Powered Crop Yield Estimation** - Get accurate yield predictions based on soil properties
- **Smart Crop Recommendations** - Receive personalized crop suggestions for your soil conditions
- **Soil Data Analysis** - Comprehensive soil property analysis and visualization
- **Market Price Integration** - Real-time market prices from data.gov.in API

### 🎨 **Enhanced User Experience**
- **Modern, Responsive Design** - Beautiful UI that works on all devices
- **Dark/Light Theme Support** - Automatic theme switching with system preference detection
- **Interactive Dashboard** - Real-time charts, statistics, and insights
- **Smooth Animations** - Framer Motion powered transitions and micro-interactions
- **Loading Skeletons** - Professional loading states throughout the application

### 🔐 **Authentication & Security**
- **Firebase Authentication** - Secure user management with email/password and Google OAuth
- **Route Protection** - Protected routes for authenticated users
- **Password Reset** - Secure password recovery system
- **Form Validation** - Real-time input validation and error handling

### 📱 **Mobile-First Design**
- **Responsive Navigation** - Hamburger menu for mobile devices
- **Touch-Friendly Interface** - Optimized for mobile and tablet use
- **Progressive Web App** - Fast loading and offline capabilities

### 🔔 **Smart Notifications**
- **Real-time Notifications** - Toast notifications for user actions
- **Notification Center** - Centralized notification management
- **Context-Aware Alerts** - Relevant notifications based on user actions

## 🛠️ **Technical Improvements**

### **Architecture & State Management**
- **Context API with useReducer** - Centralized state management
- **TypeScript Strict Mode** - Full type safety and error prevention
- **Error Boundaries** - Comprehensive error handling and recovery
- **Performance Optimization** - React.memo, lazy loading, and bundle optimization

### **UI/UX Enhancements**
- **Component Library** - Consistent design system with shadcn/ui
- **Accessibility** - ARIA labels, keyboard navigation, and screen reader support
- **Internationalization Ready** - Multi-language support infrastructure
- **Progressive Enhancement** - Graceful degradation for older browsers

### **Data & API**
- **Real-time Updates** - Live data from government APIs
- **Caching Strategy** - Intelligent data caching for better performance
- **Error Handling** - Graceful fallbacks for API failures
- **Data Validation** - Server-side and client-side validation

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Firebase project setup

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/crop-predict.git
   cd crop-predict
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   DATA_GOV_IN_API_KEY=your_data_gov_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:9002](http://localhost:9002)

## 📁 **Project Structure**

```
src/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   ├── home/              # Protected home pages
│   └── layout.tsx         # Root layout
├── components/             # Reusable components
│   ├── ui/                # Base UI components
│   ├── navigation/        # Navigation components
│   └── dashboard/         # Dashboard components
├── contexts/               # React contexts
├── hooks/                  # Custom hooks
├── lib/                    # Utilities and configurations
├── ai/                     # AI flows and tools
└── data/                   # Static data and mock data
```

## 🎯 **Key Components**

### **AppContext**
Centralized state management for:
- User authentication
- Theme preferences
- Location data
- Notifications

### **Navigation System**
- Responsive navbar with mobile support
- Theme toggle (Light/Dark/System)
- User menu with profile options
- Breadcrumb navigation

### **Dashboard**
- Interactive charts and graphs
- Real-time statistics
- Quick action cards
- Recent activity feed

### **Form System**
- Real-time validation
- Auto-save functionality
- Progress indicators
- Error handling

## 🔧 **Development**

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript check
```

### **Code Quality**
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **TypeScript** - Type safety and IntelliSense
- **Husky** - Git hooks for code quality

### **Testing**
- **Jest** - Unit testing framework
- **React Testing Library** - Component testing
- **Cypress** - End-to-end testing

## 🌟 **Recent Improvements**

### **v2.0.0 - Complete UI Overhaul**
- ✨ Modern, interactive dashboard
- 🎨 Dark/light theme support
- 📱 Mobile-first responsive design
- 🔔 Smart notification system
- 🚀 Performance optimizations
- 🛡️ Enhanced error handling
- 📊 Interactive charts and visualizations
- 🔐 Improved authentication flow

### **v1.5.0 - AI Integration**
- 🤖 AI-powered crop yield estimation
- 🧠 Machine learning model integration
- 📈 Market price prediction
- 🌱 Crop recommendation system

### **v1.0.0 - Foundation**
- 🔐 Firebase authentication
- 📊 Basic crop yield estimation
- 🗺️ Location-based data
- 📱 Responsive design

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **data.gov.in** - For providing agricultural data APIs
- **Firebase** - For authentication and database services
- **shadcn/ui** - For the beautiful component library
- **Framer Motion** - For smooth animations
- **Next.js** - For the amazing React framework

## 📞 **Support**

- **Documentation**: [docs.croppredict.com](https://docs.croppredict.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/crop-predict/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/crop-predict/discussions)
- **Email**: support@croppredict.com

---

**Made with ❤️ for Indian Farmers**

*Empowering agriculture through technology and AI*
