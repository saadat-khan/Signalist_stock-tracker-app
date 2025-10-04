<div align="center">
  <br />
    <img src="https://raw.githubusercontent.com/saadat-khan/Signalist_stock-tracker-app/cfec8288fdcc99d5ff68f5745a694f860298f2cf/Banner.svg" width="100%">
  <br />

  <div>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
    <img src="https://img.shields.io/badge/Shadcn-18181B?style=for-the-badge&logo=react&logoColor=white" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
    <img src="https://img.shields.io/badge/Inngest-4C51BF?style=for-the-badge&logo=serverless&logoColor=white" />
    <img src="https://img.shields.io/badge/Better%20Auth-1A73E8?style=for-the-badge&logo=auth0&logoColor=white" />
    <img src="https://img.shields.io/badge/Finnhub-0C7D5B?style=for-the-badge&logo=databricks&logoColor=white" />
  </div>

  <h3 align="center">🚀 Signalist – AI-Powered Stock Market App</h3>
  <p align="center">Modern real-time financial platform with alerts, charts, watchlists, and AI insights</p>
</div>

---

## 📋 <a name="table">Table of Contents</a>

1. ✨ [Introduction](#introduction)  
2. ⚙️ [Tech Stack](#tech-stack)  
3. 🔋 [Features](#features)  
4. 🤸 [Quick Start](#quick-start)  
5. 📊 [Usage](#usage)  
6. 🌍 [Roadmap](#roadmap)  
7. 🤝 [Contributing](#contributing)  
8. 🏆 [Acknowledgements](#acknowledgements)  
9. 📜 [License](#license)  

---

## <a name="introduction">✨ Introduction</a>

**Signalist** is an **AI-powered stock market app** built with **Next.js, Shadcn, Better Auth, and Inngest**.  
It provides real-time financial data, personalized alerts, watchlists, and AI-driven insights.  
Admins can manage stocks, publish news, and monitor user activity, while **event-driven workflows** power automated alerts, daily digests, and sentiment analysis.  

Whether you’re a **developer, trader, or data enthusiast**, Signalist delivers a dynamic, real-time financial platform.

---

## ⚙️ Tech Stack

- **[Next.js](https://nextjs.org/)** – Full-stack React framework with SSR/SSG support.  
- **[TypeScript](https://www.typescriptlang.org/)** – Statically typed superset of JavaScript.  
- **[TailwindCSS](https://tailwindcss.com/)** – Utility-first CSS framework.  
- **[Shadcn](https://ui.shadcn.com/)** – Accessible React components for beautiful UI.  
- **[Better Auth](https://better-auth.com/)** – Authentication & authorization with MFA + social login.  
- **[Inngest](https://www.inngest.com/)** – Event-driven workflows and background jobs.  
- **[MongoDB](https://www.mongodb.com/)** – NoSQL database for scalable data storage.  
- **[Nodemailer](https://nodemailer.com/)** – Email delivery & notifications.  
- **[Finnhub](https://finnhub.io/)** – Real-time market data API.  
- **[CodeRabbit](https://coderabbit.ai/)** – AI-powered GitHub code review assistant.  

---

## 🔋 Features

👉 **Stock Dashboard** – Real-time prices with line/candlestick charts & historical data.  
👉 **Powerful Search** – Intelligent stock search by industry, market cap, or performance.  
👉 **Watchlist & Alerts** – Personalized watchlists with instant email alerts.  
👉 **Company Insights** – PE ratio, EPS, revenue, analyst ratings, sentiment scores & filings.  
👉 **Real-Time Workflows** – Automated price updates, scheduling & AI digests powered by Inngest.  
👉 **AI Insights** – Personalized summaries, earnings notifications & daily reports.  
👉 **Custom Notifications** – Fine-tuned alerts based on user preferences.  
👉 **Analytics & Admin Dashboard** – Manage users, publish news, monitor activity.  

---

## 🤸 Quick Start

### Prerequisites
Ensure you have installed:
- [Node.js](https://nodejs.org/) (v18+ recommended)  
- [Git](https://git-scm.com/)  
- [MongoDB](https://www.mongodb.com/) instance  

### Installation

**Cloning the Repository**

```bash
git clone https://github.com/saadat-khan/Signalist_stock-tracker-app.git
cd Signalist_stock-tracker-app
```

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Set Up Environment Variables**

Create a new file named `.env` in the root of your project and add the following content:

```env
NODE_ENV='development'
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# FINNHUB
NEXT_PUBLIC_NEXT_PUBLIC_FINNHUB_API_KEY=
FINNHUB_BASE_URL=https://finnhub.io/api/v1

# MONGODB
MONGODB_URI=

# BETTER AUTH
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# GEMINI
GEMINI_API_KEY=

#NODEMAILER
NODEMAILER_EMAIL=
NODEMAILER_PASSWORD=
```

Replace the placeholder values with your real credentials. You can get these by signing up at: [**MongoDB**](https://www.mongodb.com/products/platform/atlas-database), [**Gemini**](https://aistudio.google.com/prompts/new_chat?utm_source=chatgpt.com), [**Inngest**](https://jsm.dev/stocks-inggest), [**Finnhub**](https://finnhub.io).

**Running the Project**

```bash
npm run dev
npx inngest-cli@latest dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.

---

## 📊 Usage

Sign up with Better Auth (email, Google, GitHub, etc.).

Add stocks to your watchlist.

Set alerts for price or volume changes.

Explore company insights & AI summaries.

Use the admin dashboard to manage stocks, publish news, and track users.

---

## 🌍 Roadmap

📱 Mobile app version (React Native)

🔔 Push notifications (Web + Mobile)

📈 Portfolio tracking with performance metrics

🤖 Advanced AI insights (trend predictions & risk analysis)

🌐 Multi-language support

---

## 🤝 Contributing

We welcome contributions! 🎉
Please fork the repo and submit a pull request.
Before contributing, check out the guidelines in CONTRIBUTING.md.

---

## 📜 License

This project is licensed under the MIT License.
See [LICENSE](LICENSE)
 for more details.
