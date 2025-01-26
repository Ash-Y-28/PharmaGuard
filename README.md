# PharmaGuard 💊
**Your One-Stop Drug Interaction and Safety App**

PharmaGuard is a web application designed to help users identify potential drug interactions and access detailed, reliable information about medications. Whether you're a healthcare professional or a patient, PharmaGuard empowers you to make safe and informed decisions with confidence.

---

## Features 🌟
- 🔍 **Drug Interaction Detection**: Analyze potential interactions using local database or AI.
- 🧠 **AI-Powered Recommendations**: Warnings for critical drug combinations using OpenAI’s GPT-4 model.
- ✅ **Trusted Drug Information**: Access verified and detailed drug data from legitimate sources like the FDA.
- 📊 **Interactive Interface**: Easy-to-navigate design for seamless user experience.
- 🌐 **Responsive Design**: Fully functional across browsers and devices.

---

## Tech Stack 🛠️ 
PharmaGuard is built using the following technologies:

### Frontend
- **React**: A modern JavaScript library for building user interfaces.
- **TypeScript**: Adds type safety to JavaScript for better code quality.
- **Vite**: A fast build tool optimized for modern web projects.
- **CSS3**: Responsive and visually appealing styles.

### Backend
- **Flask**: A lightweight and efficient Python framework for backend development.
- **SQLite**: A local database for quick and reliable storage of drug interaction data.
- **OpenFDA API**: Fetches verified drug information from legitimate sources.
- **OpenAI Integration**: Leverages the OpenAI API to enhance drug interaction insights.

### AI Integration
- **OpenAI GPT-4**: Provides advanced recommendations and warnings for drug combinations.

---

## How to Run the Project Locally  ⚙️ 
Follow these steps to set up PharmaGuard on your local machine:

### Clone the Repository

First, clone the repository to your local machine:
```bash
git clone https://github.com/Ash-Y-28/PharmaGuard.git
```

```
cd PharmaGuard
```

### Backend Setup

Navigate to the backend directory:
```
cd backend
```

Install the required dependencies:
```
pip install -r requirements.txt
```

Set up the database (if not already set up):
```
python setup_database.py
```

Start the Flask backend server:
```
python app.py
```

### Frontend Setup

Navigate to the frontend directory:
```
cd frontend
cd vite-frontend
```

Install the necessary Node.js dependencies:
```
npm install
```

Start the React development server:
```
npm run dev
```
Open your browser and go to:
```
http://localhost:3000
```

### Demo Video

[![Watch PharmaGuard in Action](frontend/vite-frontend/src/assets/Thumbnail.webp)](https://www.youtube.com/watch?v=jQf7EI8Ftg8)




