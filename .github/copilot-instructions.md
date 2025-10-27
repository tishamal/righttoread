# Copilot Instructions for Right to Read Admin Dashboard

## Project Overview
This is a React-based admin dashboard for managing textbooks in the "Right to Read" educational program. The application provides functionality for tracking textbook inventory, managing book availability, and organizing content by grade levels. All the published books will go though a process of convering it to digital version of it with SSML and audio format. There should be a page to reivew generated audio files and SSML text for quality before publishing and approval. Mobile applications will be sending analytics of usage of application and books. There should be a dashboard page to review analytics data with charts and graphs

## Technology Stack
- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **Build Tool**: React Scripts (Create React App)
- **Styling**: Material-UI theme system + custom CSS

## Code Style and Conventions

### TypeScript
- Use TypeScript for all new components and utilities
- Define proper interfaces for data structures
- Prefer functional components with hooks over class components
- Use strict typing, avoid `any` types when possible

### React Patterns
- Use functional components with React hooks
- Implement proper state management with useState/useEffect
- Follow Material-UI component patterns and props
- Use proper prop validation and TypeScript interfaces

### Material-UI Guidelines
- Utilize MUI's theme system for consistent styling
- Use MUI components instead of custom HTML elements
- Follow MUI's responsive design patterns (Grid, Box, Stack)
- Implement proper accessibility with MUI's built-in features

### File Organization
- Keep components modular and single-responsibility
- Place reusable components in separate files
- Use clear, descriptive naming conventions
- Import statements should be organized (external libs first, then local)

## Key Features to Maintain

### Dashboard Functionality
- Statistics cards showing book inventory overview
- Grade-based filtering system
- Search functionality across textbook library
- Status indicators (Available, Limited, Out of Stock)

### UI/UX Principles
- Responsive design that works on desktop and mobile
- Consistent color scheme using Material-UI theme
- Intuitive navigation with sidebar and top bar
- Visual feedback for user interactions (hover effects, loading states)

### Data Management
- Sample data structure for textbooks with proper typing
- Status management for book availability
- Grade level organization (9-12)
- Search and filter functionality

## Development Guidelines

### When Adding New Features
1. Create proper TypeScript interfaces for new data structures
2. Use Material-UI components for consistency
3. Implement responsive design principles
4. Add proper error handling and loading states
5. Follow the existing navigation and layout patterns

### Performance Considerations
- Use React.memo() for components that re-render frequently
- Implement proper key props for list items
- Optimize image loading for book covers
- Consider virtual scrolling for large book lists

### Accessibility
- Use proper ARIA labels and roles
- Ensure keyboard navigation works properly
- Maintain proper color contrast ratios
- Use semantic HTML structure

## Common Tasks and Patterns

### Adding a New Navigation Item
1. Add to the `navigationItems` array in App.tsx
2. Create the corresponding page component
3. Add routing logic in the main component

### Creating New Book Components
1. Define TypeScript interface for book data
2. Use Material-UI Card components for consistency
3. Implement proper status indicators with Chip components
4. Add hover effects and responsive behavior

### Implementing New Filters
1. Add filter state management with useState
2. Create filter UI with Material-UI Select or Autocomplete
3. Implement filter logic in the book display component
4. Maintain URL state for deep linking if needed

## Testing Guidelines
- Write unit tests for utility functions
- Test component rendering with different props
- Verify responsive behavior across screen sizes
- Test accessibility features with screen readers

## Security Considerations
- Validate all user inputs
- Implement proper authentication checks
- Use HTTPS for all API communications
- Follow React security best practices

When working on this project, prioritize user experience, maintainable code, and consistency with the established Material-UI design system.
