# 🚀 7anoti Project Startup Guide

If you restart your computer or everything shuts down, here is the exact step-by-step process to get your entire 7anoti app, AI workflow, and WhatsApp integration running again!

---

## Step 1: Start the Databases & Backend Server
Your Java Spring Boot backend needs PostgreSQL to run. 

1. Open **Docker Desktop** and make sure it is running.
2. Open a terminal (Command Prompt or PowerShell) and run your database and backend:
   ```bash
   # Go to your project folder
   cd d:\dev\7anotak\backend

   # Start the Postgres Database container
   docker start maliki_db

   # Run the Spring Boot backend
   .\mvnw spring-boot:run
   ```
*(Leave this terminal open)*

---

## Step 2: Start n8n & The Webhook (Ngrok)
n8n needs to be running so it can receive webhooks and talk to the Groq AI.

1. Open a **new terminal**:
   ```bash
   # Start n8n
   n8n start
   ```
*(Leave this terminal open)*

2. Open a **third terminal** to start ngrok (this connects the internet to your local n8n):
   ```bash
   ngrok http 5678
   ```
*(Leave this terminal open. Check the "Forwarding" link ngrok gives you. If it changes from what you have in your `.env` file, make sure to update your mobile app's `.env`!)*

---

## Step 3: Start the Evolution API (WhatsApp)
This connects your AI to your actual WhatsApp account.

1. Open a **fourth terminal**:
   ```bash
   # Start the Evolution API container
   docker start evolution-api
   ```
*(Note: Since you already linked your phone via QR Code, you do **not** need to scan it again! The container remembers your session).*

---

## Step 4: Start the Mobile App (Expo)
Finally, start your React Native app.

1. Open a **fifth terminal**:
   ```bash
   cd d:\dev\7anotak\mobile

   # Clear cache and start Expo
   npx expo start -c
   ```

### You are all set! 🎉
- The Backend is running.
- n8n is running.
- ngrok is exposing n8n.
- Evolution API is listening.
- The Mobile app is open.
You can now send AI reminders again!
