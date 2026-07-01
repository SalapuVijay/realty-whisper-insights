# 🏡 Realty Whisper Insights – AI-Powered Land Real Estate Assistant

**Realty Whisper Insights** is a modern, full-stack real estate platform built for premium land listings, complete with an interactive property comparison engine, EMI financial calculator, and a smart AI Assistant. 🌎✨

## 🌐 Visit the Live Demo

*   💻 **Frontend Website**: [https://realty-whisper-insights1.onrender.com](https://realty-whisper-insights1.onrender.com) 🚀
*   ⚙️ **Backend API Server**: [https://realty-whisper-insights.onrender.com](https://realty-whisper-insights.onrender.com) 📡

---

## ✨ Features

- 🤖 **AI Real Estate Assistant**: A conversational assistant powered by Google's Gemini AI to help users find plots, answer investment questions, and calculate rates.
- 📊 **Land Comparison Engine**: Compare sizes, pricing, and zoning of up to 3 plots side-by-side.
- 🧮 **EMI Financial Calculator**: Dynamic mortgage and EMI calculator for land budgets and down payments.
- 👤 **Dual Portals (Admin & Customer)**:
  - *Customers*: Save favorites, chat with sellers, book visits, and manage profiles.
  - *Sellers/Admins*: Create new listings, upload photos, manage buyers, and schedule visits.
- 💬 **Messaging System**: Built-in chat channel connecting buyers directly to plot owners/agents.
- 🌓 **Theme Customization**: Toggle between dark and light modes seamlessly.

## 🛠️ Tech Stack

### 💻 Frontend
- **Framework**: React (Vite) ⚛️
- **Styling**: Tailwind CSS & Shadcn UI 🎨
- **Routing & State**: React Router Dom & TanStack Query 🔄

### ⚙️ Backend & DB
- **Server**: Node.js & Express 🚀
- **Database**: MongoDB (via Mongoose) 🍃
- **AI Engine**: Google Gemini API Key 🧠

---

## 🗂️ Project Structure

```
├── public/                # Static assets and favicon
├── server/                # Backend API Server
│   ├── config/            # Database configuration
│   ├── controllers/       # Route controllers (Auth, AI, Properties, Chat)
│   ├── models/            # MongoDB schemas (User, Property, Message, Visit)
│   └── routes/            # Express API route declarations
├── src/                   # Frontend React Source Code
│   ├── components/        # Reusable UI parts (Charts, Cards, Dialogs)
│   ├── contexts/          # React contexts (Theme, Authentication state)
│   ├── lib/               # HTTP client integrations (Axios API connection)
│   └── pages/             # Layout pages (Dashboard, Admin, Favorites, AI Chat)
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root and in the `/server` directory to start the application locally:

### Server `.env` Configuration
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_token
GEMINI_API_KEY=your_gemini_api_key
```

### Client `.env` Configuration
```env
VITE_API_URL=http://localhost:5000/api
```
