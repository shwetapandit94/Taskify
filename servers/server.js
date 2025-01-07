import React, { useState, useEffect } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";
import "./TaskManager.css";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "",
    status: "",
  });
  const [editTaskId, setEditTaskId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.priority || !newTask.status || !newTask.due_date) {
      alert("Please select valid values for Priority, Status, and Due Date.");
      return;
    }

    try {
      await createTask(newTask);
      fetchTasks();
      setNewTask({
        title: "",
        description: "",
        due_date: "",
        priority: "",
        status: "",
      });
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleUpdateTask = async (id) => {
    try {
      const taskToUpdate = tasks.find((task) => task._id === id);
      await updateTask(id, taskToUpdate);
      fetchTasks();
      setEditTaskId(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleInputChange = (e, id = null) => {
    const { name, value } = e.target;
    if (id) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === id ? { ...task, [name]: value } : task
        )
      );
    } else {
      setNewTask({ ...newTask, [name]: value });
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "in-progress":
        return "status-in-progress";
      case "completed":
        return "status-completed";
      default:
        return "";
    }
  };

  return (
    <div className="task-manager">
      <h1>Task Manager</h1>

      {/* Create Task */}
      <div className="create-task">
        <h2>Create Task</h2>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newTask.title}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newTask.description}
          onChange={handleInputChange}
        />
        <div className="input-with-title-inline">
          <label htmlFor="due_date" className="input-title">
            Due Date:
          </label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={newTask.due_date}
            onChange={handleInputChange}
          />
        </div>

        <select
          name="priority"
          value={newTask.priority}
          onChange={handleInputChange}
        >
          <option value="">Select Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          name="status"
          value={newTask.status}
          onChange={handleInputChange}
        >
          <option value="">Select Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button onClick={handleCreateTask}>Add Task</button>
      </div>

      {/* Task List */}
      <div className="task-list">
        <h2>Tasks</h2>
        {tasks.map((task) => (
          <div
            key={task._id}
            className={`task-item ${getStatusStyle(task.status)}`}
          >
            {editTaskId === task._id ? (
              <>
                <input
                  type="text"
                  name="title"
                  value={task.title}
                  onChange={(e) => handleInputChange(e, task._id)}
                />
                <input
                  type="text"
                  name="description"
                  value={task.description}
                  onChange={(e) => handleInputChange(e, task._id)}
                />
                <div className="input-with-title">
                  <label htmlFor="due_date" className="input-title">
                    Due Date:
                  </label>
                  <input
                    type="date"
                    id="due_date"
                    name="due_date"
                    value={task.due_date?.slice(0, 10)}
                    onChange={(e) => handleInputChange(e, task._id)}
                  />
                </div>
                <select
                  name="priority"
                  value={task.priority}
                  onChange={(e) => handleInputChange(e, task._id)}
                >
                  <option value="">Select Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <select
                  name="status"
                  value={task.status}
                  onChange={(e) => handleInputChange(e, task._id)}
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button onClick={() => handleUpdateTask(task._id)}>Save</button>
                <button onClick={() => setEditTaskId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p>Due: {new Date(task.due_date).toLocaleDateString()}</p>
                <p>Priority: {task.priority}</p>
                <p>Status: {task.status}</p>
                <button
                  className="edit-button"
                  onClick={() => setEditTaskId(task._id)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteTask(task._id)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;
