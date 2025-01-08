const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect("mongodb://0.0.0.0:27017/taskify", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Task Schema
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  due_date: Date,
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
});

const Task = mongoose.model("Task", taskSchema);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Taskify API",
      version: "1.0.0",
      description: "API documentation for Taskify - a task management system.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local server",
      },
    ],
    paths: {
      "/tasks": {
        get: {
          summary: "Retrieve all tasks",
          description:
            "Fetch a list of all tasks with optional filters for status and priority.",
          parameters: [
            {
              name: "status",
              in: "query",
              description: "Filter tasks by status (e.g., pending, completed).",
              required: false,
              schema: {
                type: "string",
              },
            },
            {
              name: "priority",
              in: "query",
              description:
                "Filter tasks by priority (e.g., low, medium, high).",
              required: false,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            200: {
              description: "A list of tasks.",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Task",
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: "Create a new task",
          description:
            "Add a new task with title, description, due date, priority, and status.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TaskInput",
                },
              },
            },
          },
          responses: {
            201: {
              description: "Task created successfully.",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Task",
                  },
                },
              },
            },
          },
        },
      },
      "/tasks/{id}": {
        get: {
          summary: "Retrieve a specific task",
          description: "Fetch a task by its unique ID.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "ID of the task to retrieve.",
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            200: {
              description: "Task details.",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Task",
                  },
                },
              },
            },
          },
        },
        put: {
          summary: "Update a specific task",
          description: "Modify details of an existing task.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "ID of the task to update.",
              schema: {
                type: "string",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TaskInput",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Task updated successfully.",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Task",
                  },
                },
              },
            },
          },
        },
        delete: {
          summary: "Delete a specific task",
          description: "Remove a task by its unique ID.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "ID of the task to delete.",
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            204: {
              description: "Task deleted successfully.",
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Task: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Unique identifier for the task.",
            },
            title: {
              type: "string",
              description: "Title of the task.",
            },
            description: {
              type: "string",
              description: "Details about the task.",
            },
            due_date: {
              type: "string",
              format: "date",
              description: "Due date for the task.",
            },
            priority: {
              type: "string",
              description: "Priority of the task (low, medium, high).",
            },
            status: {
              type: "string",
              description: "Current status of the task (pending, completed).",
            },
          },
        },
        TaskInput: {
          type: "object",
          required: ["title", "description", "due_date", "priority", "status"],
          properties: {
            title: {
              type: "string",
              description: "Title of the task.",
            },
            description: {
              type: "string",
              description: "Details about the task.",
            },
            due_date: {
              type: "string",
              format: "date",
              description: "Due date for the task.",
            },
            priority: {
              type: "string",
              description: "Priority of the task (low, medium, high).",
            },
            status: {
              type: "string",
              description: "Current status of the task (pending, completed).",
            },
          },
        },
      },
    },
  },
};

// POST /tasks: Create a new task
app.post("/tasks", async (req, res) => {
  try {
    const { title, description, due_date, priority, status } = req.body;
    const newTask = new Task({
      title,
      description,
      due_date,
      priority,
      status: status || "pending",
    });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Error creating task" });
  }
});

const swaggerSpec = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// GET /tasks: Retrieve all tasks (with optional filters like status or priority)
app.get("/tasks", async (req, res) => {
  try {
    const { status, priority } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// GET /tasks/:id: Retrieve a specific task by ID
app.get("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error fetching task" });
  }
});

// PUT /tasks/:id: Update a specific task by ID
app.put("/tasks/:id", async (req, res) => {
  try {
    const { title, description, due_date, priority, status } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, due_date, priority, status },
      { new: true }
    );

    if (!updatedTask)
      return res.status(404).json({ message: "Task not found" });
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
});

// DELETE /tasks/:id: Delete a specific task by ID
app.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
});

// Start server
const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
