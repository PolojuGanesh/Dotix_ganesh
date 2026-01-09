# Job Scheduler & Automation System - Setup & Testing Guide

## Project Overview

A full-stack mini job scheduling and automation system built with:

- **Frontend**: React with React Router
- **Backend**: Node.js/Express
- **Database**: SQLite
- **Webhooks**: Automatic webhook triggers on job completion

---

## ✅ Completed Implementation

### Backend Components

#### 1. **Database Setup** (`db.js`)

- SQLite database with jobs table
- Table schema with fields:
  - `id` (Primary Key, Auto-increment)
  - `taskName` (Text, Required)
  - `payload` (JSON)
  - `priority` (Low, Medium, High)
  - `status` (pending, running, completed)
  - `createdAt`, `updatedAt`, `completedAt` (Timestamps)

#### 2. **Express Server** (`server.js`)

Implements 4 REST API endpoints:

**POST /jobs** - Create a new job

- Input: `taskName`, `priority`, `payload` (optional JSON)
- Validation: Required fields, JSON validation
- Returns: Created job object with ID
- Status: Always set to `pending`

**GET /jobs** - List all jobs with filtering

- Query params: `status`, `priority`
- Supports combined filters: `/jobs?status=pending&priority=High`
- Returns: Array of jobs sorted by creation date

**GET /jobs/:id** - Get job details

- Returns: Full job object with parsed payload
- Error handling: 404 if job not found

**POST /run-job/:id** - Run/execute a job

- Updates status: `pending` → `running` → `completed`
- Simulates 3-second processing time
- Triggers webhook automatically on completion
- Prevents re-running completed jobs

**Webhook Integration**

- Triggered when job status becomes `completed`
- Sends POST request to configured WEBHOOK_URL
- Payload includes: jobId, taskName, status, priority, payload, completedAt

### Frontend Components

#### 1. **CreateJobForm** Component

- Form inputs: Task Name, Priority dropdown, JSON Payload textarea
- Validation: Non-empty task name, valid JSON payload
- Success/error messages
- Auto-refresh dashboard after job creation

#### 2. **Dashboard** Component

- Table view of all jobs with columns: ID, Task Name, Priority, Status, Created At
- Filter dropdowns: Status (All/Pending/Running/Completed), Priority (All/Low/Medium/High)
- Run button: Only visible for pending jobs
- Details button: Navigate to job detail page
- Auto-refresh every 2 seconds
- Status badges with color coding
- Priority indicators with color coding

#### 3. **JobDetail** Component

- Full job information display
- Formatted JSON payload display
- Run button for pending jobs
- Real-time status updates
- Back navigation to dashboard
- Auto-refresh every 2 seconds

#### 4. **App.js** (Main)

- React Router setup
- Two main routes:
  - `/` : Home page with CreateJobForm + Dashboard
  - `/jobs/:id` : Job detail page

#### 5. **Styling**

- Responsive CSS for all components
- Color-coded status badges (Pending: Yellow, Running: Blue with pulse, Completed: Green)
- Priority indicators (Low: Green, Medium: Yellow, High: Red)
- Professional gradient header
- Mobile-responsive layout

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- npm

### Installation

1. **Backend Setup**

```bash
cd backend
npm install
```

2. **Frontend Setup**

```bash
cd frontend
npm install
```

### Running the Application

**Terminal 1 - Start Backend:**

```bash
cd backend
npm start
# Backend runs on http://localhost:5000
```

**Terminal 2 - Start Frontend:**

```bash
cd frontend
npm start
# Frontend runs on http://localhost:3000 (opens automatically)
```

---

## 🧪 Testing Checklist

### Test 1: Create a Job

1. Go to http://localhost:3000
2. Fill in the "Create New Job" form:
   - Task Name: "Send Email"
   - Priority: "High"
   - Payload: `{"email": "user@example.com"}`
3. Click "Create Job"
4. ✅ Should see success message
5. ✅ Job should appear in dashboard with status "PENDING"

### Test 2: View Jobs in Dashboard

1. Observe the jobs table
2. ✅ Columns should show: ID, Task Name, Priority, Status, Created At
3. ✅ Status badge should be yellow (Pending)
4. ✅ Priority should be red for "High"

### Test 3: Filter Jobs

1. In dashboard, use the filter dropdowns
2. Select Status filter: "Pending"
3. ✅ Only pending jobs should show
4. Select Priority filter: "High"
5. ✅ Only high-priority pending jobs should show
6. Reset filters to "All" and "All"
7. ✅ All jobs should reappear

### Test 4: View Job Details

1. Click the "Details" button on any job
2. ✅ Should navigate to `/jobs/{id}`
3. ✅ Should show full job information
4. ✅ Should show formatted JSON payload
5. Click "Back to Dashboard" button
6. ✅ Should return to dashboard

### Test 5: Run a Job

1. From dashboard, click "Run" button on a pending job
2. ✅ Button should show "Running..."
3. ✅ In detail page, job status should change to "RUNNING" (blue badge)
4. Wait 3 seconds
5. ✅ Status should change to "COMPLETED" (green badge)
6. ✅ "Completed At" timestamp should be visible in detail view

### Test 6: Webhook Trigger (Optional - Requires External Webhook Service)

1. Get a test webhook URL from https://webhook.site
2. Update backend webhook URL:
   - Edit `server.js` and change `WEBHOOK_URL`
   - OR set environment variable: `WEBHOOK_URL=your-url`
3. Run a job
4. ✅ Check webhook.site dashboard
5. ✅ Should receive POST request with job data:
   ```json
   {
     "jobId": 1,
     "taskName": "Send Email",
     "status": "completed",
     "priority": "High",
     "payload": { "email": "user@example.com" },
     "completedAt": "2024-01-09T...",
     "createdAt": "2024-01-09T..."
   }
   ```

### Test 7: Data Persistence

1. Create multiple jobs with different priorities and payloads
2. Stop and restart the backend
3. ✅ All jobs should still be visible in dashboard (stored in SQLite)

### Test 8: Status Flow Validation

1. Create a new job
2. Verify initial status is "PENDING"
3. Click Run
4. Verify status changes to "RUNNING"
5. Wait 3 seconds
6. Verify status changes to "COMPLETED"
7. Try clicking Run again
8. ✅ Should get error message (job already completed)

---

## 📋 API Endpoint Reference

### Create Job

```bash
POST http://localhost:5000/jobs
Content-Type: application/json

{
  "taskName": "Send Email",
  "priority": "High",
  "payload": {"email": "user@example.com"}
}
```

### List Jobs (with filters)

```bash
GET http://localhost:5000/jobs
GET http://localhost:5000/jobs?status=pending
GET http://localhost:5000/jobs?priority=High
GET http://localhost:5000/jobs?status=running&priority=Medium
```

### Get Job Detail

```bash
GET http://localhost:5000/jobs/:id
```

### Run Job

```bash
POST http://localhost:5000/jobs/:id
```

### Health Check

```bash
GET http://localhost:5000/health
```

---

## 🔧 Configuration

### Webhook Configuration

In `backend/server.js`, line ~15:

```javascript
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://webhook.site/unique-id";
```

Change to your webhook URL from https://webhook.site or another webhook service.

### Backend Port

Default: `5000`
Can be changed in `backend/server.js`, line ~72

### Frontend Port

Default: `3000`
Configured by create-react-app

---

## 🐛 Troubleshooting

### Backend won't start

- Check if port 5000 is already in use
- Ensure SQLite is installed: `npm list sqlite3`
- Check database permissions

### Frontend shows blank page

- Check browser console for errors
- Ensure backend is running on port 5000
- Try hard refresh: Ctrl+Shift+R or Cmd+Shift+R

### CORS errors

- Backend has CORS enabled with `cors()` middleware
- If still getting errors, check that frontend is on `localhost:3000`

### Jobs not persisting

- Check that `backend/database.db` file is created
- Verify SQLite write permissions in backend directory

### Webhook not triggering

- Ensure WEBHOOK_URL is set correctly
- Check backend logs for webhook errors
- Verify webhook service is accessible

---

## 📁 Project Structure

```
dotix_ganesh/
├── backend/
│   ├── db.js              (Database setup & initialization)
│   ├── server.js          (Express server & APIs)
│   ├── database.db        (SQLite database file)
│   ├── package.json
│   └── node_modules/
│
└── frontend/
    ├── src/
    │   ├── App.js         (Main component with routing)
    │   ├── App.css
    │   ├── CreateJobForm.js
    │   ├── CreateJobForm.css
    │   ├── Dashboard.js
    │   ├── Dashboard.css
    │   ├── JobDetail.js
    │   ├── JobDetail.css
    │   ├── index.js
    │   └── ...
    ├── public/
    ├── package.json
    └── node_modules/
```

---

## 🎯 Key Features Implemented

✅ **Job Creation** - Create jobs with task name, priority, and custom payload
✅ **Job Storage** - Persistent storage in SQLite database
✅ **Job Listing** - Display all jobs in a table format
✅ **Filtering** - Filter by status and priority
✅ **Job Details** - View full job information and payload
✅ **Job Execution** - Run jobs with simulated 3-second processing
✅ **Status Tracking** - Pending → Running → Completed flow
✅ **Webhooks** - Automatic webhook trigger on job completion
✅ **Real-time Updates** - Auto-refresh every 2 seconds
✅ **Error Handling** - Validation and error messages
✅ **Responsive UI** - Works on desktop and tablet
✅ **User Feedback** - Success/error messages and loading states

---

## 🚀 Next Steps (Optional Enhancements)

1. **Job History** - View completed jobs by date range
2. **Retries** - Automatic retry on failed jobs
3. **Job Logs** - Store and display job execution logs
4. **Scheduled Jobs** - Schedule jobs to run at specific times
5. **Bulk Operations** - Create multiple jobs at once
6. **Job Templates** - Save job configurations as templates
7. **Notifications** - Email/SMS notifications on job completion
8. **Analytics** - Dashboard with job statistics and charts

---

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review component console logs
3. Verify backend is running: `curl http://localhost:5000/health`
4. Check database file exists: `backend/database.db`

---

**Last Updated:** January 9, 2026
**Status:** ✅ Ready for Testing
