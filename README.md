# InvDues Reminder

An invoice reminder app and follow-up app that uses Zapier integration to automate workflows. It is deployed at: https://invdues-reminder.vercel.app/

This is a MERN stack app that implements:
- CRUD Operations
- Authentication using Google OAuth
- Automation using Zapier

## To run locally,
1. Clone the repo and run:
```
cd frontend && npm install
cd backend && npm install
```

2. Go to Google Console and create an app with OAuth enabled. Get `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` keys and save them in a `.env`.

3. To start the app on http://localhost:5173, run :
```
cd frontend && npm run dev
cd backend && npm start
```

