import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./JobDetail.css";

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    // Auto-refresh every 2 seconds
    const interval = setInterval(fetchJobDetails, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/jobs/${id}`);
      if (!response.ok) throw new Error("Job not found");
      const data = await response.json();
      setJob(data);
      setError("");
    } catch (err) {
      setError(err.message);
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRunJob = async () => {
    try {
      setRunning(true);
      const response = await fetch(`http://localhost:5000/run-job/${id}`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to run job");
      }

      // Refresh job details
      await fetchJobDetails();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    return `badge badge-${status.toLowerCase()}`;
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority.toLowerCase()}`;
  };

  if (loading) return <div className="loading">Loading job details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!job) return <div className="error-message">Job not found</div>;

  return (
    <div className="job-detail">
      <div className="header">
        <button onClick={() => navigate("/")} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>Job #{job.id} Details</h1>
      </div>

      <div className="detail-card">
        <div className="detail-row">
          <label>Task Name:</label>
          <span>{job.taskName}</span>
        </div>

        <div className="detail-row">
          <label>Status:</label>
          <span className={getStatusBadgeClass(job.status)}>
            {job.status.toUpperCase()}
          </span>
        </div>

        <div className="detail-row">
          <label>Priority:</label>
          <span className={getPriorityClass(job.priority)}>{job.priority}</span>
        </div>

        <div className="detail-row">
          <label>Created At:</label>
          <span>{formatDate(job.createdAt)}</span>
        </div>

        <div className="detail-row">
          <label>Updated At:</label>
          <span>{formatDate(job.updatedAt)}</span>
        </div>

        {job.completedAt && (
          <div className="detail-row">
            <label>Completed At:</label>
            <span>{formatDate(job.completedAt)}</span>
          </div>
        )}

        <div className="detail-row">
          <label>Payload:</label>
          <pre className="payload-display">
            {JSON.stringify(job.payload, null, 2)}
          </pre>
        </div>
      </div>

      <div className="actions">
        {job.status === "pending" && (
          <button
            onClick={handleRunJob}
            disabled={running}
            className="btn btn-success btn-lg"
          >
            {running ? "Running..." : "Run Job"}
          </button>
        )}

        {job.status === "running" && (
          <div className="running-info">
            <span className="spinning">⟳</span>
            Job is currently running...
          </div>
        )}

        {job.status === "completed" && (
          <div className="completed-info">✓ Job completed successfully</div>
        )}
      </div>
    </div>
  );
}

export default JobDetail;
