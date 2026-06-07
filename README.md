# HundredCode Dashboard

A React + Vite dashboard for tracking the top 100 HundredCode problems with authentication, completion badges, and a digital certificate experience.

## Features

- React + Vite project structure
- Login authentication demo with persistent state
- Protected dashboard route
- Top 100 important HundredCode problems list
- Completion toggle for each problem
- Badge unlock system for Easy, Medium, Hard milestones
- Digital certificate modal when all 100 problems are complete
- Progress stored in `localStorage`

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Start the development server

```bash
npm run dev
```

3. Open the URL shown in the terminal (usually `http://localhost:5173`)

## Login Credentials

- Email: `student@hundredcode.com`
- Password: `Leet@123`

## Notes

- The form is built as an authentication demo for access control.
- Progress is saved locally so refreshes keep your completed problem state.
- Once all 100 problems are marked complete, a certificate button becomes available.
- Last developer: Nithyasree S
