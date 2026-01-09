# Job Scheduler & Automation System

A full-stack mini job scheduling and automation system built with **React**, **Node.js/Express**, and **SQLite**. This system allows you to create, manage, and automatically execute background jobs with webhook integration.

## 🎯 Features

- **✅ Job Creation** - Create jobs with custom task names, priorities, and JSON payloads
- **✅ Job Management** - View all jobs in a responsive table with real-time updates
- **✅ Advanced Filtering** - Filter jobs by status (Pending/Running/Completed) and priority (Low/Medium/High)
- **✅ Job Execution** - Run jobs with simulated 3-second processing
- **✅ Status Tracking** - Track job lifecycle: Pending → Running → Completed
- **✅ Webhook Integration** - Automatic webhook trigger when jobs complete
- **✅ Persistent Storage** - All jobs stored in SQLite database
- **✅ Real-time UI** - Auto-refreshing dashboard every 2 seconds
- **✅ Error Handling** - Comprehensive validation and error messages
- **✅ Responsive Design** - Mobile-friendly interface

## 📋 Requirements

- Node.js v14.0.0 or higher
- npm v6.0.0 or higher
- SQLite3

## 🚀 Quick Start

### 1. Clone/Setup the Project

```bash
# The project is already structured in d:\dotix_ganesh
# Backend folder: d:\dotix_ganesh\backend
# Frontend folder: d:\dotix_ganesh\frontend
```

### 2. Install Dependencies

```bash
# Terminal 1 - Backend
cd backend
npm install

# Terminal 2 - Frontend
cd frontend
npm install
```

### 3. Start the Application

```bash
# Terminal 1 - Start Backend Server
cd backend
npm start
# Backend runs on http://localhost:5000

# Terminal 2 - Start Frontend
cd frontend
npm start
# Frontend runs on http://localhost:3000
```

The application will open automatically in your browser at `http://localhost:3000`.

## 🏗️ Architecture

### Backend Architecture

```
Express Server (Port 5000)
    ├── GET /health
    ├── POST /jobs
    ├── GET /jobs?status=X&priority=Y
    ├── GET /jobs/:id
    └── POST /run-job/:id
        └── [Webhook Trigger]
                └── POST to configured WEBHOOK_URL
```

### Frontend Architecture

```
React Router (Port 3000)
    ├── / (Home)
    │   ├── CreateJobForm
    │   └── Dashboard
    └── /jobs/:id
        └── JobDetail
```

### Database Schema

```sql
CREATE TABLE jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taskName TEXT NOT NULL,
  payload TEXT,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  completedAt DATETIME
);
```

## 📚 API Documentation

### POST /jobs - Create Job

Create a new background job.

**Request:**

```json
{
  "taskName": "Send Email",
  "priority": "High",
  "payload": {
    "email": "user@example.com",
    "subject": "Hello"
  }
}
```

**Response:**

```json
{
  "message": "Job created successfully",
  "job": {
    "id": 1,
    "taskName": "Send Email",
    "priority": "High",
    "status": "pending",
    "payload": { "email": "user@example.com", "subject": "Hello" },
    "createdAt": "2024-01-09T10:30:00.000Z",
    "updatedAt": "2024-01-09T10:30:00.000Z",
    "completedAt": null
  }
}
```

### GET /jobs - List Jobs

Get all jobs with optional filtering.

**Query Parameters:**

- `status` - Filter by: `pending`, `running`, `completed`
- `priority` - Filter by: `Low`, `Medium`, `High`

**Examples:**

```
GET /jobs
GET /jobs?status=pending
GET /jobs?priority=High
GET /jobs?status=running&priority=Low
```

**Response:**

```json
{
  "count": 2,
  "jobs": [
    {
      "id": 1,
      "taskName": "Send Email",
      "priority": "High",
      "status": "pending",
      ...
    }
  ]
}
```

### GET /jobs/:id - Job Details

Get full details of a specific job.

**Response:**

```json
{
  "id": 1,
  "taskName": "Send Email",
  "priority": "High",
  "status": "pending",
  "payload": { "email": "user@example.com" },
  "createdAt": "2024-01-09T10:30:00.000Z",
  "updatedAt": "2024-01-09T10:30:00.000Z",
  "completedAt": null
}
```

### POST /run-job/:id - Execute Job

Run a job. Status transitions: pending → running → completed.

**Response:**

```json
{
  "message": "Job is now running",
  "jobId": 1
}
```

After 3 seconds, the job automatically transitions to `completed` and triggers a webhook.

## 🔔 Webhook Integration

When a job completes, the system automatically sends a POST request to your configured webhook URL.

### Webhook Configuration

Edit `backend/server.js` line ~15:

```javascript
const WEBHOOK_URL = "https://webhook.site/your-unique-id";
```

Or set environment variable:

```bash
set WEBHOOK_URL=https://webhook.site/your-unique-id
```

### Webhook Payload

```json
{
  "jobId": 1,
  "taskName": "Send Email",
  "status": "completed",
  "priority": "High",
  "payload": {
    "email": "user@example.com"
  },
  "completedAt": "2024-01-09T10:33:05.123Z",
  "createdAt": "2024-01-09T10:30:00.000Z"
}
```

### Testing Webhook

1. Visit https://webhook.site
2. Copy the unique URL
3. Update `WEBHOOK_URL` in `backend/server.js`
4. Restart backend server
5. Create and run a job
6. Check webhook.site dashboard for incoming request

## 📱 User Interface

### Home Page (/)

- **Create Job Form**: Input task name, select priority, enter JSON payload
- **Job Dashboard**: Table view with all jobs, filtering options, and action buttons

### Job Detail Page (/jobs/:id)

- Full job information display
- Formatted JSON payload
- Status badge with real-time updates
- Run button (for pending jobs)
- Back to dashboard button

## 🎨 UI Components

### CreateJobForm

- Task Name input (required)
- Priority dropdown (Low, Medium, High)
- JSON Payload textarea
- Form validation with error messages
- Success notification on job creation

### Dashboard

- Jobs table with columns: ID, Task Name, Priority, Status, Created At
- Filter dropdowns for Status and Priority
- Refresh button for manual refresh
- Run button for pending jobs
- Details button to view job details
- Color-coded status badges
- Color-coded priority indicators
- Auto-refresh every 2 seconds

### JobDetail

- Back navigation button
- Full job information display
- Formatted JSON payload in code block
- Run button (only for pending jobs)
- Status indicator with timestamps
- Auto-refresh every 2 seconds

## 🔄 Job Lifecycle

```
┌──────────────────────────────────────────────────────────┐
│                    Job Lifecycle                         │
└──────────────────────────────────────────────────────────┘

1. CREATE JOB
   └─→ Status: pending

2. RUN JOB
   └─→ Status: running
       (3 seconds processing)

3. JOB COMPLETES
   └─→ Status: completed
   └─→ completedAt timestamp set
   └─→ Webhook triggered
       └─→ POST to WEBHOOK_URL
```

## 📂 Project Structure

```
dotix_ganesh/
├── backend/
│   ├── server.js           # Express server & REST APIs
│   ├── db.js              # SQLite database setup
│   ├── database.db        # SQLite database file (auto-created)
│   ├── package.json
│   ├── package-lock.json
│   └── node_modules/
│
├── frontend/
│   ├── src/
│   │   ├── App.js                # Main component with routing
│   │   ├── App.css               # Global styles
│   │   ├── CreateJobForm.js      # Job creation form
│   │   ├── CreateJobForm.css     # Form styles
│   │   ├── Dashboard.js          # Jobs list & filter
│   │   ├── Dashboard.css         # Dashboard styles
│   │   ├── JobDetail.js          # Job detail view
│   │   ├── JobDetail.css         # Detail view styles
│   │   ├── index.js              # React entry point
│   │   ├── index.css
│   │   └── ...
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   └── node_modules/
│
├── SETUP_AND_TESTING_GUIDE.md    # Detailed setup & testing
├── QUICK_REFERENCE.md             # Quick reference guide
└── README.md                       # This file
```

## ⚙️ Configuration

### Backend Configuration

**Port:** Edit `backend/server.js` line ~72

```javascript
const PORT = 5000; // Change this
```

**Webhook URL:** Edit `backend/server.js` line ~15

```javascript
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://webhook.site/unique-id";
```

**Database Path:** By default stored at `backend/database.db`

### Frontend Configuration

**API Base URL:** Hardcoded to `http://localhost:5000`
To change, update all `fetch()` calls in components

**Auto-refresh Interval:** Dashboard and JobDetail refresh every 2 seconds
To change, modify `setInterval()` calls (lines ~46 in Dashboard.js, ~18 in JobDetail.js)

## 🧪 Testing Guide

### Test 1: Create a Job

1. Open http://localhost:3000
2. Fill in Create Job form
3. Click "Create Job"
4. Verify success message
5. Job appears in dashboard with "PENDING" status

### Test 2: Filter Jobs

1. Use Status dropdown to filter by pending/running/completed
2. Use Priority dropdown to filter by Low/Medium/High
3. Combine filters
4. Reset to "All" to show all jobs

### Test 3: Run a Job

1. Click "Run" button on a pending job
2. Status changes to "RUNNING"
3. Wait 3 seconds
4. Status changes to "COMPLETED"
5. Webhook is triggered (if configured)

### Test 4: View Details

1. Click "Details" button on any job
2. Navigate to `/jobs/:id` page
3. View full job information
4. Click "Back to Dashboard"

### Test 5: Webhook

1. Get webhook URL from https://webhook.site
2. Update WEBHOOK_URL in backend/server.js
3. Create and run a job
4. Check webhook.site for incoming request
5. Verify payload contains job data

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process on port 5000 if needed
taskkill /PID <PID> /F
```

### Frontend Shows Blank Page

- Check browser console for errors
- Ensure backend is running: `curl http://localhost:5000/health`
- Hard refresh: Ctrl+Shift+R

### CORS Errors

- Backend has CORS enabled
- Check frontend is on `localhost:3000`
- Check backend is on `localhost:5000`

### Jobs Not Persisting

- Check `backend/database.db` exists
- Verify write permissions in backend directory
- Check backend logs for errors

### Webhook Not Triggering

- Verify WEBHOOK_URL is correct in `backend/server.js`
- Check backend logs for webhook errors
- Ensure webhook service is accessible
- Test with https://webhook.site

## 📦 Dependencies

### Backend

```json
{
  "express": "^5.2.1",
  "cors": "^2.8.5",
  "body-parser": "^1.20.2",
  "sqlite": "^5.1.1",
  "sqlite3": "^5.1.7"
}
```

### Frontend

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "react-scripts": "5.0.x"
}
```

## 🚀 Deployment

### Backend Deployment (Heroku Example)

```bash
cd backend
heroku create your-app-name
git push heroku main
```

### Frontend Deployment (Vercel Example)

```bash
cd frontend
npm run build
vercel --prod
```

## 🔒 Security Considerations

- Input validation on both frontend and backend
- JSON payload validation
- SQL injection prevention (parameterized queries)
- CORS enabled with appropriate headers
- Error messages don't leak sensitive info

## 🎓 Learning Outcomes

This project demonstrates:

- Full-stack MERN architecture
- REST API design and implementation
- React Router for navigation
- SQLite database design and queries
- Webhook integration
- Real-time UI updates
- Error handling and validation
- Frontend-backend communication
- Component composition in React

## 📝 License

MIT License - Feel free to use this project for learning and development.

## 📞 Support

For detailed setup and testing instructions, see:

- [SETUP_AND_TESTING_GUIDE.md](./SETUP_AND_TESTING_GUIDE.md)
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

## 🎉 Getting Started

```bash
# 1. Start Backend
cd backend
npm start

# 2. Start Frontend (in another terminal)
cd frontend
npm start

# 3. Open Browser
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

**Happy Job Scheduling!** 🚀
