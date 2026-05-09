import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const initialTasks = [
  {
    id: 1,
    title: "Finish portfolio README updates",
    details: "Add screenshots, tech stack, and live deployment links.",
    priority: "High",
    category: "Portfolio",
    dueDate: "2026-05-12",
    estimate: "45 min",
    status: "In Progress",
    completed: false,
  },
  {
    id: 2,
    title: "Deploy React apps on Vercel",
    details: "Connect GitHub repos and verify production builds.",
    priority: "Medium",
    category: "Launch",
    dueDate: "2026-05-15",
    estimate: "1 hr",
    status: "Backlog",
    completed: false,
  },
  {
    id: 3,
    title: "Pin projects on GitHub profile",
    details: "Feature the strongest projects at the top of the profile.",
    priority: "Low",
    category: "GitHub",
    dueDate: "2026-05-10",
    estimate: "15 min",
    status: "Done",
    completed: true,
  },
];

const priorityOrder = {
  High: 1,
  Medium: 2,
  Low: 3,
};

const lanes = ["Backlog", "In Progress", "Review", "Done"];

function App() {
  const fileInputRef = useRef(null);
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem("taskflow-tasks");
      const parsedTasks = savedTasks ? JSON.parse(savedTasks) : initialTasks;
      return parsedTasks.map(normalizeTask);
    } catch {
      return initialTasks;
    }
  });
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("General");
  const [dueDate, setDueDate] = useState("");
  const [estimate, setEstimate] = useState("30 min");
  const [status, setStatus] = useState("Backlog");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [importMessage, setImportMessage] = useState("Planner saves automatically on this device.");

  useEffect(() => {
    localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const categories = useMemo(() => {
    return ["All", ...new Set(tasks.map((task) => task.category))];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const visibleTasks = tasks.filter((task) => {
      const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
      const matchesCategory = categoryFilter === "All" || task.category === categoryFilter;
      const matchesStatus = statusFilter === "All" || task.status === statusFilter;
      const matchesSearch = !search
        || task.title.toLowerCase().includes(search)
        || task.details.toLowerCase().includes(search)
        || task.category.toLowerCase().includes(search);

      return matchesPriority && matchesCategory && matchesStatus && matchesSearch;
    });

    return [...visibleTasks].sort((a, b) => {
      if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
      if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [categoryFilter, priorityFilter, searchTerm, statusFilter, tasks]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const openTasks = tasks.filter((task) => !task.completed);
  const reviewCount = openTasks.filter((task) => task.status === "Review").length;
  const highPriorityCount = openTasks.filter((task) => task.priority === "High").length;
  const dueSoonCount = openTasks.filter((task) => {
    if (!task.dueDate) return false;
    const today = startOfDay(new Date());
    const due = startOfDay(new Date(`${task.dueDate}T00:00:00`));
    const daysAway = Math.round((due - today) / 86400000);
    return daysAway <= 3;
  }).length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const nextTask = [...openTasks]
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })[0];
  const tasksByLane = lanes.map((lane) => ({
    lane,
    tasks: filteredTasks.filter((task) => task.status === lane),
  }));

  function addTask(event) {
    event.preventDefault();

    if (!title.trim()) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title: title.trim(),
        details: details.trim() || "No details added yet.",
        priority,
        category: category.trim() || "General",
        dueDate,
        estimate: estimate.trim() || "30 min",
        status,
        completed: false,
      },
    ]);

    setTitle("");
    setDetails("");
    setPriority("Medium");
    setCategory("General");
    setDueDate("");
    setEstimate("30 min");
    setStatus("Backlog");
  }

  function toggleTask(id) {
    setTasks(tasks.map((task) => (
      task.id === id
        ? {
          ...task,
          completed: !task.completed,
          status: task.completed ? "Backlog" : "Done",
        }
        : task
    )));
  }

  function moveTask(id, nextStatus) {
    setTasks(tasks.map((task) => (
      task.id === id
        ? { ...task, status: nextStatus, completed: nextStatus === "Done" }
        : task
    )));
  }

  function deleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  function clearCompleted() {
    setTasks(tasks.filter((task) => !task.completed));
  }

  function exportPlanner() {
    const planner = {
      app: "TaskFlow",
      exportedAt: new Date().toISOString(),
      tasks,
    };

    downloadFile(
      "taskflow-planner.json",
      JSON.stringify(planner, null, 2),
      "application/json"
    );
    setImportMessage("Planner file exported. You can import it later on any browser.");
  }

  function exportSummary() {
    const summary = tasks.map((task) => (
      `${task.status}: ${task.title}
Priority: ${task.priority}
Category: ${task.category}
Due: ${task.dueDate || "No due date"}
Estimate: ${task.estimate}
Notes: ${task.details}`
    )).join("\n\n---\n\n");

    downloadFile("taskflow-summary.txt", summary || "No tasks yet.", "text/plain");
    setImportMessage("Readable planner summary exported.");
  }

  function handleFileImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        const importedTasks = Array.isArray(imported) ? imported : imported.tasks;

        if (!Array.isArray(importedTasks)) {
          throw new Error("Planner file does not include tasks.");
        }

        setTasks(importedTasks.map((task) => normalizeTask({ ...task, id: task.id || Date.now() })));
        setImportMessage(`Imported ${importedTasks.length} tasks from ${file.name}.`);
      } catch {
        setImportMessage("That file could not be imported. Use a TaskFlow JSON export.");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  }

  function importBulkTasks() {
    const rows = bulkText
      .split("\n")
      .map((row) => row.trim())
      .filter(Boolean);

    if (!rows.length) {
      setImportMessage("Paste one task per line before importing.");
      return;
    }

    const importedTasks = rows.map((row, index) => {
      const [taskTitle, taskDetails, taskCategory, taskPriority, taskDueDate, taskEstimate] = row
        .split("|")
        .map((part) => part.trim());

      return normalizeTask({
        id: Date.now() + index,
        title: taskTitle,
        details: taskDetails || "Imported task.",
        category: taskCategory || "Imported",
        priority: ["High", "Medium", "Low"].includes(taskPriority) ? taskPriority : "Medium",
        dueDate: taskDueDate || "",
        estimate: taskEstimate || "30 min",
        status: "Backlog",
        completed: false,
      });
    });

    setTasks([...tasks, ...importedTasks]);
    setBulkText("");
    setImportMessage(`Imported ${importedTasks.length} tasks from pasted planner info.`);
  }

  return (
    <main className="app-shell">
      <section className="taskflow">
        <header className="hero">
          <div>
            <p className="eyebrow">Daily planner</p>
            <h1>TaskFlow</h1>
            <p className="subtitle">
              Plan priorities, due dates, notes, and categories in one clean dashboard.
            </p>
          </div>

          <div className="progress-card" aria-label={`${progress}% of tasks complete`}>
            <span>{progress}%</span>
            <p>Complete</p>
          </div>
        </header>

        <section className="stats-grid" aria-label="Task overview">
          <article>
            <span>{tasks.length}</span>
            <p>Total tasks</p>
          </article>
          <article>
            <span>{tasks.length - completedCount}</span>
            <p>Open</p>
          </article>
          <article>
            <span>{completedCount}</span>
            <p>Done</p>
          </article>
          <article>
            <span>{reviewCount}</span>
            <p>In review</p>
          </article>
          <article>
            <span>{highPriorityCount}</span>
            <p>High priority</p>
          </article>
          <article>
            <span>{dueSoonCount}</span>
            <p>Due soon</p>
          </article>
        </section>

        <div className="planner-grid">
          <aside className="insights" aria-label="Planner insights">
            <section className="focus-panel">
              <div>
                <p className="eyebrow">Next focus</p>
                <h2>{nextTask ? nextTask.title : "All clear"}</h2>
                <p>{nextTask ? nextTask.details : "Add a task whenever new work comes in."}</p>
              </div>
              <span>{nextTask ? formatDueDate(nextTask.dueDate) : "No open tasks"}</span>
            </section>

            <section className="agenda">
              <p className="eyebrow">Today at a glance</p>
              <div className="agenda-row">
                <span>Deep work</span>
                <strong>{openTasks.length ? openTasks[0].estimate : "0 min"}</strong>
              </div>
              <div className="agenda-row">
                <span>Priority load</span>
                <strong>{highPriorityCount} high</strong>
              </div>
              <div className="agenda-row">
                <span>Needs action</span>
                <strong>{dueSoonCount} soon</strong>
              </div>
            </section>

            <section className="data-panel">
              <p className="eyebrow">Save and import</p>
              <p className="panel-copy">{importMessage}</p>
              <div className="data-actions">
                <button onClick={exportPlanner} type="button">Export planner</button>
                <button onClick={exportSummary} type="button">Export summary</button>
                <button onClick={() => fileInputRef.current?.click()} type="button">Import file</button>
              </div>
              <input
                ref={fileInputRef}
                className="file-input"
                type="file"
                accept="application/json,.json"
                onChange={handleFileImport}
              />
              <textarea
                value={bulkText}
                onChange={(event) => setBulkText(event.target.value)}
                placeholder="Paste tasks: Title | Notes | Category | Priority | YYYY-MM-DD | Estimate"
                aria-label="Bulk task import"
              />
              <button className="wide-button" onClick={importBulkTasks} type="button">
                Import pasted tasks
              </button>
            </section>
          </aside>

          <section className="workspace">
            <form className="task-form" onSubmit={addTask}>
              <label>
                Task
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Add a new task"
                  aria-label="Task title"
                />
              </label>
              <label>
                Notes
                <input
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="What needs to happen?"
                  aria-label="Task details"
                />
              </label>
              <label>
                Category
                <input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="Category"
                  aria-label="Task category"
                />
              </label>
              <label>
                Priority
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  aria-label="Task priority"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
              <label>
                Status
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  aria-label="Task status"
                >
                  {lanes.filter((lane) => lane !== "Done").map((lane) => (
                    <option key={lane}>{lane}</option>
                  ))}
                </select>
              </label>
              <label>
                Due
                <input
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  type="date"
                  aria-label="Due date"
                />
              </label>
              <label>
                Estimate
                <input
                  value={estimate}
                  onChange={(event) => setEstimate(event.target.value)}
                  placeholder="30 min"
                  aria-label="Task estimate"
                />
              </label>
              <button type="submit">Add task</button>
            </form>

            <section className="controls" aria-label="Task controls">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search tasks, notes, or categories"
                aria-label="Search tasks"
              />
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                aria-label="Filter by category"
              >
                {categories.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by status"
              >
                <option>All</option>
                {lanes.map((lane) => (
                  <option key={lane}>{lane}</option>
                ))}
              </select>
              <button onClick={clearCompleted} type="button">Clear done</button>
            </section>

            <div className="toolbar" aria-label="Priority filters">
              {["All", "High", "Medium", "Low"].map((option) => (
                <button
                  key={option}
                  className={priorityFilter === option ? "active" : ""}
                  onClick={() => setPriorityFilter(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>

            <section className="board" aria-label="Task board">
              {tasksByLane.map(({ lane, tasks: laneTasks }) => (
                <section className="lane" key={lane}>
                  <header>
                    <h2>{lane}</h2>
                    <span>{laneTasks.length}</span>
                  </header>

                  <div className="task-list">
                    {laneTasks.map((task) => (
                      <article className={task.completed ? "task completed" : "task"} key={task.id}>
                        <div className="task-topline">
                          <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                          <span>{formatDueDate(task.dueDate)}</span>
                        </div>

                        <div className="task-copy">
                          <h3>{task.title}</h3>
                          <p>{task.details}</p>
                          <div className="task-meta">
                            <span>{task.category}</span>
                            <span>{task.estimate}</span>
                          </div>
                        </div>

                        <div className="task-actions">
                          <select
                            value={task.status}
                            onChange={(event) => moveTask(task.id, event.target.value)}
                            aria-label={`Move ${task.title}`}
                          >
                            {lanes.map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </select>
                          <button onClick={() => toggleTask(task.id)} type="button">
                            {task.completed ? "Reopen" : "Complete"}
                          </button>
                          <button className="delete" onClick={() => deleteTask(task.id)} type="button">
                            Remove
                          </button>
                        </div>
                      </article>
                    ))}

                    {laneTasks.length === 0 && (
                      <div className="empty-state">
                        <h3>No tasks</h3>
                        <p>This lane is clear.</p>
                      </div>
                    )}
                  </div>
                </section>
              ))}
            </section>
          </section>
        </div>
      </section>
    </main>
  );
}

function normalizeTask(task) {
  const normalized = {
    id: task.id || Date.now(),
    title: task.title || "Untitled task",
    details: task.details || "No details added yet.",
    priority: ["High", "Medium", "Low"].includes(task.priority) ? task.priority : "Medium",
    category: task.category || "General",
    dueDate: task.dueDate || "",
    estimate: task.estimate || "30 min",
    completed: Boolean(task.completed),
    status: lanes.includes(task.status) ? task.status : "Backlog",
  };

  return {
    ...normalized,
    status: normalized.completed ? "Done" : normalized.status,
  };
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDueDate(dueDate) {
  if (!dueDate) return "No due date";

  const today = startOfDay(new Date());
  const due = startOfDay(new Date(`${dueDate}T00:00:00`));
  const daysAway = Math.round((due - today) / 86400000);

  if (daysAway < 0) return "Overdue";
  if (daysAway === 0) return "Due today";
  if (daysAway === 1) return "Due tomorrow";
  return due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default App;
