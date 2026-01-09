import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchJobs = async (status = "", priority = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (priority) params.append("priority", priority);

      const response = await fetch(
        `http://localhost:5000/jobs?${params.toString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch jobs");

      const data = await response.json();
      setJobs(data.jobs || []);
      setError("");
    } catch (err) {
      setError(err.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(statusFilter, priorityFilter);
    // Auto-refresh every 2 seconds
    const interval = setInterval(() => {
      fetchJobs(statusFilter, priorityFilter);
    }, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (newStatus = "", newPriority = "") => {
    setStatusFilter(newStatus);
    setPriorityFilter(newPriority);
    fetchJobs(newStatus, newPriority);
  };

  const handleRunJob = async (jobId) => {
    try {
      setRefreshing(true);
      const response = await fetch(`http://localhost:5000/run-job/${jobId}`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to run job");
        return;
      }

      // Refresh jobs after running
      await fetchJobs(statusFilter, priorityFilter);
    } catch (err) {
      alert("Error running job: " + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewDetails = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const getStatusBadgeClass = (status) => {
    return `badge badge-${status.toLowerCase()}`;
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority.toLowerCase()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="dashboard">
      <h1>Job Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value, priorityFilter)}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="priority-filter">Priority:</label>
          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={(e) => handleFilterChange(statusFilter, e.target.value)}
          >
            <option value="">All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <button
          onClick={() => fetchJobs(statusFilter, priorityFilter)}
          disabled={loading}
          className="refresh-btn"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading && <div className="loading">Loading jobs...</div>}

      {!loading && jobs.length === 0 && (
        <div className="no-jobs">No jobs found. Create one to get started!</div>
      )}

      {!loading && jobs.length > 0 && (
        <table className="jobs-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Task Name</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>#{job.id}</td>
                <td>{job.taskName}</td>
                <td>
                  <span className={getPriorityClass(job.priority)}>
                    {job.priority}
                  </span>
                </td>
                <td>
                  <span className={getStatusBadgeClass(job.status)}>
                    {job.status.toUpperCase()}
                  </span>
                </td>
                <td>{formatDate(job.createdAt)}</td>
                <td className="actions">
                  <button
                    onClick={() => handleViewDetails(job.id)}
                    className="btn btn-info"
                    disabled={refreshing}
                  >
                    Details
                  </button>
                  {job.status === "pending" && (
                    <button
                      onClick={() => handleRunJob(job.id)}
                      className="btn btn-success"
                      disabled={refreshing}
                    >
                      Run
                    </button>
                  )}
                  {job.status !== "pending" && (
                    <span className="status-text">{job.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;
