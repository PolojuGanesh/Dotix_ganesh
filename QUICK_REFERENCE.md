# Job Scheduler & Automation System - Quick Reference

## Project Structure Overview

### Backend (`backend/`)

- **db.js** - Database initialization and helper functions
- **server.js** - Express server with 4 API endpoints
- **database.db** - SQLite database (created automatically)

### Frontend (`frontend/`)

- **App.js** - Main component with React Router
- **CreateJobForm.js** - Form to create new jobs
- **Dashboard.js** - List and filter jobs
- **JobDetail.js** - View job details and run jobs

---

## API Endpoints Summary

| Method | Endpoint       | Purpose                      |
| ------ | -------------- | ---------------------------- |
| POST   | `/jobs`        | Create new job               |
| GET    | `/jobs`        | List jobs (supports filters) |
| GET    | `/jobs/:id`    | Get job details              |
| POST   | `/run-job/:id` | Run/execute a job            |

### Query Parameters for GET /jobs

- `status` - Filter by: pending, running, completed
- `priority` - Filter by: Low, Medium, High
- Example: `/jobs?status=pending&priority=High`

---

## Job Data Structure

```json
{
  "id": 1,
  "taskName": "Send Email",
  "priority": "High",
  "status": "pending",
  "payload": {
    "email": "user@example.com"
  },
  "createdAt": "2024-01-09T10:30:00.000Z",
  "updatedAt": "2024-01-09T10:30:00.000Z",
  "completedAt": null
}
```

---

## Status Lifecycle

```
┌─────────┐      ┌─────────┐      ┌───────────┐
│ PENDING │ ────→│ RUNNING │ ────→│ COMPLETED │
└─────────┘      └─────────┘      └───────────┘
  (initial)     (when "Run"    (after 3 sec)
                 is clicked)    → triggers webhook
```

---

## Quick Start Commands

```bash
# Terminal 1 - Start Backend
cd backend
npm start
# Runs on http://localhost:5000

# Terminal 2 - Start Frontend
cd frontend
npm start
# Runs on http://localhost:3000
```

---

## Frontend Routes

| Route       | Component                       | Purpose         |
| ----------- | ------------------------------- | --------------- |
| `/`         | App (CreateJobForm + Dashboard) | Home page       |
| `/jobs/:id` | JobDetail                       | Job detail view |

---

## Key Features

✅ Create jobs with flexible JSON payload
✅ Filter jobs by status and priority
✅ Real-time job status tracking
✅ Automatic webhook on completion
✅ Persistent storage with SQLite
✅ Responsive React UI with routing
✅ Error handling and validation

---

## Testing Webhook

1. Get URL from https://webhook.site
2. Update `WEBHOOK_URL` in `backend/server.js`
3. Run a job
4. Check webhook.site for the incoming request

**Webhook Payload:**

```json
{
  "jobId": 1,
  "taskName": "Send Email",
  "status": "completed",
  "priority": "High",
  "payload": {...},
  "completedAt": "2024-01-09T...",
  "createdAt": "2024-01-09T..."
}
```

---

## File Locations

- Backend Server: `backend/server.js`
- Database Setup: `backend/db.js`
- Database File: `backend/database.db`
- Main React App: `frontend/src/App.js`
- Create Form: `frontend/src/CreateJobForm.js`
- Dashboard: `frontend/src/Dashboard.js`
- Job Details: `frontend/src/JobDetail.js`

---

## Dependencies

**Backend:**

- express
- cors
- body-parser
- sqlite3

**Frontend:**

- react
- react-router-dom

---

## Common Issues & Solutions

| Issue                 | Solution                                     |
| --------------------- | -------------------------------------------- |
| CORS errors           | Backend CORS is enabled, check port 5000     |
| Jobs not saving       | Check backend is running, db.js initialized  |
| Frontend blank page   | Hard refresh (Ctrl+Shift+R), check console   |
| Can't run job         | Job must be in "pending" status              |
| Webhook not triggered | Check URL in server.js, ensure job completes |

---

## Example Usage Flow

1. **Create Job** → POST /jobs with taskName, priority, payload
2. **View in Dashboard** → GET /jobs returns all jobs
3. **Click Run** → POST /run-job/:id starts execution
4. **Watch Status** → Status changes pending → running → completed
5. **View Details** → GET /jobs/:id shows full info
6. **Webhook Triggers** → POST to WEBHOOK_URL with job data

---

**Ready to start? Run the quick start commands above!** 🚀
