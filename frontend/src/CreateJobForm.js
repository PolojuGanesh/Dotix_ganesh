import React, { useState } from "react";
import "./CreateJobForm.css";

function CreateJobForm({ onJobCreated }) {
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [payloadJson, setPayloadJson] = useState("{}");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate
    if (!taskName.trim()) {
      setError("Task name is required");
      return;
    }

    try {
      // Parse JSON payload
      const payload = JSON.parse(payloadJson);

      setLoading(true);
      const response = await fetch("http://localhost:5000/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName: taskName.trim(),
          priority,
          payload,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.details ? data.details.join(", ") : "Failed to create job"
        );
      }

      const data = await response.json();
      setSuccess("Job created successfully!");

      // Reset form
      setTaskName("");
      setPriority("Medium");
      setPayloadJson("{}");

      // Notify parent
      if (onJobCreated) {
        onJobCreated(data.job);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Error creating job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-job-form">
      <h2>Create New Job</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="taskName">Task Name *</label>
          <input
            id="taskName"
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="e.g., Send Email"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority *</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={loading}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="payload">Payload (JSON)</label>
          <textarea
            id="payload"
            value={payloadJson}
            onChange={(e) => setPayloadJson(e.target.value)}
            placeholder='{"email": "user@example.com"}'
            rows="5"
            disabled={loading}
          />
          <small>Enter valid JSON object</small>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Creating..." : "Create Job"}
        </button>
      </form>
    </div>
  );
}

export default CreateJobForm;
