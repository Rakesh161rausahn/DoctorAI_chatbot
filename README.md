# 🩺 AI Disease Predictor

A modern, responsive web application that acts as an AI-powered health assessment chatbot. Users can describe their symptoms in natural language to receive an initial evaluation, including possible condition predictions, risk levels, recommended actions, and specialist referrals.

![AI Disease Predictor](https://img.shields.io/badge/Status-Active-brightgreen.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5-purple.svg)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC.svg)

## ✨ Features

- **Conversational AI Chatbot**: Natural language symptom collection simulating a professional medical assistant.
- **Intelligent Health Assessment**: Generates structured predictions including condition name, confidence score, risk level, and a medical advisory explanation.
- **Recommended Specialist Locator**: Intelligently identifies the correct medical specialist (e.g., Neurologist, Cardiologist) based on symptoms and allows you to locate nearby doctors in one click using Google Maps.
- **Actionable Advice**: Provides clear, easy-to-read step-by-step recommended actions.
- **Report Management**: Built-in support to Print the report or securely Share it natively via the Web Share API.
- **Safety First**: Clearly displays disclaimers that the tool is for informational purposes and directs users with severe symptoms to immediate emergency care.

## 🛠️ Tech Stack

- **Frontend Framework**: React (Bootstrapped with Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI Backend / Engine**: OpenRouter API (`gpt-oss-20b` or standard LLM models)

## 🚀 Getting Started

Follow these steps to run the application locally on your machine.

## ⚡ Quick Deploy (Netlify)

If you want the fastest secure production setup, use Netlify with the included serverless function.

1. Push this repo to GitHub.
2. Import repo in Netlify.
3. Add environment variable in Netlify: `OPENROUTER_API_KEY=your_key`.
4. Deploy.

The app will use `/.netlify/functions/chat` automatically in production, keeping your provider key off the client.

### 1. Installation

First, clone the repository or open the project folder, then install the dependencies:

```bash
npm install
```

### 2. Environment Setup

For production (GitHub Pages), do not place provider keys in frontend env files. The key would be public.

Use one of these two modes:

1. Secure mode (recommended): set a backend proxy URL in `.env`.

```env
VITE_API_PROXY_URL="https://your-backend.example.com/api/chat"
```

2. Local-only mode (development convenience): call OpenRouter directly from browser.

```env
VITE_OPENROUTER_API_KEY="sk-or-v1-..."
```

If both are set, the app prefers `VITE_API_PROXY_URL`.

### 3. Run the Development Server

Start the Vite local development server:

```bash
npm run dev
```

Open your browser and navigate to the URL provided in your terminal (usually `http://localhost:5173/` or `http://localhost:5174/`).

## GitHub Pages Deployment

1. Create a GitHub repository and push this project.
2. Install dependencies:

```bash
npm install
```

3. Publish:

```bash
npm run deploy
```

4. In GitHub repo settings, open Pages and set source to `gh-pages` branch.

After this, each `npm run deploy` updates the live site.

## Netlify Deployment (Recommended For Secure API)

This repo is now preconfigured for Netlify using:

1. `netlify.toml` for build/publish settings.
2. `netlify/functions/chat.js` as a secure serverless proxy.

### Steps

1. Push your code to GitHub.
2. In Netlify, click **Add new site** -> **Import an existing project**.
3. Select your GitHub repo.
4. Build settings should auto-detect from `netlify.toml`:

```text
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
```

5. In Netlify site settings, open **Environment variables** and add:

```env
OPENROUTER_API_KEY=sk-or-v1-...
```

6. Deploy the site.

The frontend will call `/.netlify/functions/chat` automatically in production.

### Optional: Custom backend URL

If you want to use another backend (not Netlify Functions), set:

```env
VITE_API_PROXY_URL=https://your-backend.example.com/api/chat
```

in Netlify environment variables and redeploy.

### Troubleshooting After Deploy

If chat/prediction is not working on Netlify:

1. Confirm `OPENROUTER_API_KEY` is set in Netlify environment variables.
2. Trigger **Redeploy site** after changing environment variables.
3. Check Netlify function logs for `chat` in the Netlify dashboard.
4. Verify browser requests to `/.netlify/functions/chat` return HTTP 200.
5. If using OpenAI instead of OpenRouter, set `OPENAI_API_KEY` and update provider logic in the function.

## Using OpenAI/OpenRouter Safely With GitHub Pages

GitHub Pages is static hosting. Any key inside frontend code can be copied by anyone.

Safe pattern:

1. Keep frontend on GitHub Pages.
2. Deploy a small backend endpoint (Cloudflare Workers, Netlify Functions, Vercel Functions, or Render).
3. Store your provider key only in backend secrets.
4. Set frontend `VITE_API_PROXY_URL` to that backend endpoint.

Minimal backend behavior:

1. Accept POST with `{ model, messages }`.
2. Add `Authorization: Bearer <secret key>` server-side.
3. Forward to OpenAI/OpenRouter API.
4. Return response JSON to frontend.

## ⚠️ Medical Disclaimer

**IMPORTANT:** This application is completely experimental and designed for informational and educational purposes only. The assessments are generated by artificial intelligence. It does **not** replace professional medical advice, diagnosis, or treatment. If you are experiencing a medical emergency, call emergency services immediately.

## 📝 Folder Structure

* `src/App.jsx` - Main application logic and state management.
* `src/components/Header.jsx` - UI Header and titling.
* `src/components/ChatbotPanel.jsx` - Conversational UI for entering symptoms.
* `src/components/PredictionPanel.jsx` - Intermediate loading and prediction trigger screen.
* `src/components/ResultPanel.jsx` - Dashboard displaying the final AI Health Assessment.
* `src/components/ActionButtons.jsx` - Buttons for Printing, Sharing, Resetting, and finding local specialists.
* `src/utils/aiLogic.js` - The core integration with OpenRouter API for parsing chat and formatting strict JSON medical predictions.

Documentation updated on 2026-03-28 with Netlify deployment and secure API proxy guidance.
