const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { runAsync, getAsync, allAsync } = require("./db");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://webhook.site/unique-id"; // Replace with your webhook URL

// ============= HELPER FUNCTIONS =============

// Validate job data
function validateJobData(data) {
  const errors = [];

  if (!data.taskName || data.taskName.trim() === "") {
    errors.push("taskName is required and cannot be empty");
  }

  if (!data.priority || !["Low", "Medium", "High"].includes(data.priority)) {
    errors.push("priority must be one of: Low, Medium, High");
  }

  // Validate payload is valid JSON if provided
  if (data.payload) {
    if (typeof data.payload === "string") {
      try {
        JSON.parse(data.payload);
      } catch (e) {
        errors.push("payload must be valid JSON");
      }
    }
  }

  return errors;
}

// Trigger webhook
async function triggerWebhook(job) {
  try {
    const payload =
      typeof job.payload === "string" ? JSON.parse(job.payload) : job.payload;

    const webhookData = {
      jobId: job.id,
      taskName: job.taskName,
      status: job.status,
      priority: job.priority,
      payload: payload,
      completedAt: job.completedAt,
      createdAt: job.createdAt,
    };

    console.log("Triggering webhook:", WEBHOOK_URL);

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookData),
    });

    if (response.ok) {
      console.log("Webhook triggered successfully");
    } else {
      console.log("Webhook returned status:", response.status);
    }
  } catch (error) {
    console.error("Error triggering webhook:", error.message);
  }
}

// ============= API ENDPOINTS =============

// POST /jobs - Create a new job
app.post("/jobs", async (req, res) => {
  try {
    const { taskName, payload, priority } = req.body;

    // Validate input
    const validationErrors = validateJobData({ taskName, payload, priority });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors,
      });
    }

    const payloadStr = payload ? JSON.stringify(payload) : JSON.stringify({});
    const status = "pending";

    const result = await runAsync(
      "INSERT INTO jobs (taskName, payload, priority, status) VALUES (?, ?, ?, ?)",
      [taskName, payloadStr, priority, status]
    );

    // Fetch and return the created job
    const job = await getAsync("SELECT * FROM jobs WHERE id = ?", [result.id]);

    res.status(201).json({
      message: "Job created successfully",
      job: {
        ...job,
        payload: JSON.parse(job.payload),
      },
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res
      .status(500)
      .json({ error: "Failed to create job", details: error.message });
  }
});

// GET /jobs - Get all jobs with optional filtering
app.get("/jobs", async (req, res) => {
  try {
    const { status, priority } = req.query;

    let query = "SELECT * FROM jobs";
    const params = [];

    // Build query with filters
    const filters = [];
    if (status) {
      filters.push("status = ?");
      params.push(status);
    }
    if (priority) {
      filters.push("priority = ?");
      params.push(priority);
    }

    if (filters.length > 0) {
      query += " WHERE " + filters.join(" AND ");
    }

    query += " ORDER BY createdAt DESC";

    const jobs = await allAsync(query, params);

    // Parse payload for each job
    const parsedJobs = jobs.map((job) => ({
      ...job,
      payload: job.payload ? JSON.parse(job.payload) : {},
    }));

    res.json({
      count: parsedJobs.length,
      jobs: parsedJobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch jobs", details: error.message });
  }
});

// GET /jobs/:id - Get job detail
app.get("/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const job = await getAsync("SELECT * FROM jobs WHERE id = ?", [id]);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({
      ...job,
      payload: job.payload ? JSON.parse(job.payload) : {},
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch job", details: error.message });
  }
});

// POST /run-job/:id - Run a job
app.post("/run-job/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if job exists
    const job = await getAsync("SELECT * FROM jobs WHERE id = ?", [id]);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Check if already running or completed
    if (job.status === "running") {
      return res.status(400).json({ error: "Job is already running" });
    }

    if (job.status === "completed") {
      return res.status(400).json({ error: "Job has already been completed" });
    }

    // Update status to running
    await runAsync(
      "UPDATE jobs SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      ["running", id]
    );

    res.json({
      message: "Job is now running",
      jobId: id,
    });

    // Simulate background processing - complete after 3 seconds
    setTimeout(async () => {
      try {
        const completedAt = new Date().toISOString();
        await runAsync(
          "UPDATE jobs SET status = ?, completedAt = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
          ["completed", completedAt, id]
        );

        // Fetch completed job and trigger webhook
        const completedJob = await getAsync("SELECT * FROM jobs WHERE id = ?", [
          id,
        ]);
        await triggerWebhook(completedJob);

        console.log(`Job ${id} completed and webhook triggered`);
      } catch (error) {
        console.error("Error completing job:", error);
      }
    }, 3000);
  } catch (error) {
    console.error("Error running job:", error);
    res
      .status(500)
      .json({ error: "Failed to run job", details: error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Backend is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Webhook URL configured as: ${WEBHOOK_URL}`);
});
