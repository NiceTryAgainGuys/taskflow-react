# TaskFlow

TaskFlow is a React productivity dashboard for planning tasks, organizing priorities, and moving work through a simple board-style workflow. I built it as a portfolio project to practice turning a basic to-do list idea into something that feels closer to a real productivity app.

## Features

- Add tasks with a title, notes, category, priority, due date, estimate, and status
- Move work through `Backlog`, `In Progress`, `Review`, and `Done`
- Search tasks by title, notes, or category
- Filter by priority, category, and workflow status
- Track dashboard stats like open tasks, completed tasks, high-priority items, due-soon work, and completion percentage
- Highlight the next task that needs attention
- Save tasks automatically in the browser with `localStorage`
- Export the planner as JSON or a readable text summary
- Import a saved TaskFlow planner file
- Paste bulk task lists using a simple structured format
- Clear completed work when the board gets crowded
- Responsive layout for desktop and mobile screens

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- Local Storage
- Browser File APIs

## How to Run Locally

```bash
npm install
npm run dev
```

To create a production build:

```bash
npm run build
```

## What I Learned

- How to manage a larger React state object with forms, filters, and derived dashboard stats
- How to use `localStorage` so user data stays saved after refresh
- How import/export features work with browser file APIs
- How to organize a dashboard layout that still works on smaller screens
- How small UI details like status lanes, filters, and summaries make a simple app feel more useful

## Future Improvements

- Add drag-and-drop between workflow columns
- Add editing for existing tasks
- Add calendar or weekly planning views
- Add optional cloud sync or account-based storage
- Add more tests around filtering, importing, and task status changes

## Repository Name Ideas

1. `taskflow-productivity-planner`
2. `workflow-task-management-dashboard`
3. `personal-productivity-planner-react`

## GitHub About

React task management dashboard with workflow lanes, filters, local storage, and import/export tools.

## Suggested Topics

`react` `vite` `task-manager` `productivity` `local-storage`

## Resume Bullet

- Built TaskFlow, a React productivity dashboard with workflow lanes, task filtering, local storage persistence, and JSON/text export features to practice state management and responsive UI design.

## LinkedIn Project Description

TaskFlow is a React task management dashboard I built to practice building a more complete front-end app. It lets users create detailed tasks, organize them by priority and status, filter/search their work, save data in the browser, and export or import planner files. This project helped me get more comfortable with React state, derived data, browser storage, and responsive dashboard design.
