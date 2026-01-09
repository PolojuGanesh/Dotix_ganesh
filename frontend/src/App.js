import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import CreateJobForm from "./CreateJobForm";
import Dashboard from "./Dashboard";
import JobDetail from "./JobDetail";

function App() {
  const [jobCreated, setJobCreated] = React.useState(null);

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>Job Scheduler & Automation System</h1>
          <p>Create, manage, and run background jobs</p>
        </header>

        <main className="app-main">
          <Routes>
            <Route
              path="/"
              element={
                <div className="home-page">
                  <CreateJobForm onJobCreated={(job) => setJobCreated(job)} />
                  <Dashboard key={jobCreated?.id || "all"} />
                </div>
              }
            />
            <Route path="/jobs/:id" element={<JobDetail />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; 2024 Job Scheduler System. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
