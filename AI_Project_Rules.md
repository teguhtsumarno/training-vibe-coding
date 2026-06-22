# Project Rules for AI Coding Assistant

## Purpose

This document defines the development standards that must be followed by Amazon Q, GitHub Copilot, Cursor, Gemini CLI, or any AI Coding Assistant when generating code for this project.

---

# Technology Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- ShadCN UI
- React Hook Form
- Zod Validation
- Browser Local Storage

---

# Coding Standards

## General Rules

- Use TypeScript strictly
- Avoid `any`
- Use ES2022 syntax
- Prefer async/await over Promise chaining
- Use reusable components
- Keep functions small and focused
- Follow Single Responsibility Principle

---

## React Rules

- Use Functional Components only
- Use React Hooks
- Avoid Class Components
- Use custom hooks for reusable logic
- Avoid unnecessary re-renders

---

## Naming Convention

### Component

```typescript
EmployeeForm.tsx
LeaveRequestTable.tsx
```

### Function

```typescript
createEmployee()
updateLeaveRequest()
```

### Constant

```typescript
MAX_LEAVE_DAYS
DEFAULT_PAGE_SIZE
```

### Type

```typescript
Employee
LeaveRequest
```

---

# Folder Structure

```text
src/
├── app/
├── components/
├── hooks/
├── lib/
├── services/
├── types/
├── validators/
└── constants/
```

---

# UI Standards

- Mobile First
- Responsive Layout
- Use ShadCN Components whenever possible
- Use Card for dashboard widgets
- Use Dialog for modal forms
- Use Toast for notifications

---

# Form Standards

- Use React Hook Form
- Use Zod validation
- Show validation errors
- Disable submit button during processing

---

# Local Storage Standards

Create dedicated service layer.

Example:

```typescript
EmployeeStorageService
LeaveStorageService
```

Do not access localStorage directly from page components.

---

# Output Requirements

When generating code:

- Generate complete code
- Include imports
- Include TypeScript typing
- Include comments only when necessary
- Avoid placeholder implementation
- Follow existing project structure

---

# Code Review Checklist

Before completing implementation:

- Check TypeScript errors
- Check duplicated code
- Check unused imports
- Check accessibility issues
- Check responsive behavior
- Check maintainability
