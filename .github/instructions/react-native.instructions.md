description: 'React Native development standards and best practices'
applyTo: '**/*.jsx, **/*.tsx, **/*.js, **/*.ts'
---

# React Native Development Instructions

Instructions for building high-quality React Native applications with modern patterns, hooks, and best practices following the official documentation at https://reactnative.dev and https://react.dev.

## Project Context
- React Native (0.7x+) with React 18+
- Mobile applications targeting iOS and Android
- TypeScript for type safety (when applicable)
- Functional components with hooks as default
- Follow React and React Native official style guides and best practices
- Use modern React Native tooling (React Native CLI, Metro, or Expo where appropriate)
- Implement proper component composition and reusability patterns

## Development Standards

### Architecture
- Use functional components with hooks as the primary pattern
- Implement component composition over inheritance
- Organize components by feature or domain for scalability
- Separate presentational and container components clearly
- Use custom hooks for reusable stateful logic
- Implement proper component hierarchies with clear data flow

### TypeScript Integration
- Use TypeScript interfaces for props, state, and component definitions
- Define proper types for event handlers and refs
- Implement generic components where appropriate
- Use strict mode in `tsconfig.json` for type safety
- Leverage React's built-in types (`React.FC`, `React.ComponentProps`, etc.)
- Create union types for component variants and states

### Component Design
- Follow the single responsibility principle for components
- Use descriptive and consistent naming conventions
- Implement proper prop validation with TypeScript or PropTypes
- Design components to be testable and reusable
- Keep components small and focused on a single concern
- Use composition patterns (render props, children as functions)

### State Management
- Use `useState` for local component state
- Implement `useReducer` for complex state logic
- Leverage `useContext` for sharing state across component trees
- Consider external state management (Redux Toolkit, Zustand) for complex applications
- Implement proper state normalization and data structures
- Use React Query or SWR for server state management

### Hooks and Effects
- Use `useEffect` with proper dependency arrays to avoid infinite loops
- Implement cleanup functions in effects to prevent memory leaks
- Use `useMemo` and `useCallback` for performance optimization when needed
- Create custom hooks for reusable stateful logic
- Follow the rules of hooks (only call at the top level)
- Use `useRef` for accessing imperative methods on components and storing mutable values

### Styling
- Use React Native's `StyleSheet` API or well-supported styling libraries (e.g., `styled-components/native`, utility-style libraries)
- Design layouts with Flexbox and responsive units to support multiple screen sizes and orientations
- Implement consistent spacing, typography, and color systems using shared style tokens or theme objects
- Prefer composition (wrapping components) over deeply nested style overrides
- Ensure accessibility by using accessible touch targets, proper contrast, and platform accessibility props

### Performance Optimization
- Use `React.memo` for component memoization when appropriate
- Implement code splitting with `React.lazy` and `Suspense`
- Optimize bundle size with tree shaking and dynamic imports
- Use `useMemo` and `useCallback` judiciously to prevent unnecessary re-renders
- Implement virtual scrolling for large lists
- Profile components with React DevTools to identify performance bottlenecks

### Data Fetching
- Use modern data fetching libraries (React Query, SWR, Apollo Client)
- Implement proper loading, error, and success states
- Handle race conditions and request cancellation
- Use optimistic updates for better user experience
- Implement proper caching strategies
- Handle offline scenarios and network errors gracefully

### Error Handling
- Implement Error Boundaries for component-level error handling
- Use proper error states in data fetching
- Implement fallback UI for error scenarios
- Log errors appropriately for debugging
- Handle async errors in effects and event handlers
- Provide meaningful error messages to users

### Forms and Validation
- Use controlled components for form inputs
- Implement proper form validation with libraries like Formik, React Hook Form
- Handle form submission and error states appropriately
- Implement accessibility features for forms (accessible labels, hints, and roles via React Native accessibility props)
- Use debounced validation for better user experience
- Handle file uploads and complex form scenarios

### Routing
- Use React Navigation (stack, tab, drawer, and nested navigators) for in-app navigation
- Define typed route params and use strongly-typed navigation helpers
- Handle deep linking and initial routes for incoming links and notifications
- Implement lazy loading for screens where it provides measurable benefit
- Ensure correct back button handling on Android and consistent navigation patterns across platforms

### Testing
- Write unit tests for components using React Native Testing Library (or React Testing Library for React Native)
- Test component behavior, not implementation details
- Use Jest for test runner and assertion library
- Implement integration tests for complex component interactions
- Mock external dependencies and API calls appropriately
- Test accessibility features and keyboard navigation

### Security
- Validate and sanitize any data rendered in WebViews or HTML-based components to prevent injection attacks
- Use HTTPS for all external API calls
- Implement proper authentication and authorization patterns
- Avoid storing sensitive data in insecure storage (e.g., plain AsyncStorage); prefer secure storage solutions provided by the platform or libraries

### Accessibility
- Use React Native accessibility props such as `accessible`, `accessibilityLabel`, `accessibilityHint`, and `accessibilityRole`
- Ensure all interactive elements are reachable and operable via screen readers and platform navigation (TalkBack, VoiceOver)
- Provide descriptive labels for icons and images that convey meaning
- Implement proper color contrast ratios and respect system font scaling settings
- Test with platform accessibility tools (TalkBack, VoiceOver, Switch Control) on real devices or emulators

## Implementation Process
1. Plan component architecture and data flow
2. Set up project structure with proper folder organization
3. Define TypeScript interfaces and types
4. Implement core components with proper styling
5. Add state management and data fetching logic
6. Implement routing and navigation
7. Add form handling and validation
8. Implement error handling and loading states
9. Add testing coverage for components and functionality
10. Optimize performance and bundle size
11. Ensure accessibility compliance
12. Add documentation and code comments

## Additional Guidelines
- Follow React's naming conventions (PascalCase for components, camelCase for functions)
- Use meaningful commit messages and maintain clean git history
- Implement proper code splitting and lazy loading strategies
- Document complex components and custom hooks with JSDoc
- Use ESLint and Prettier for consistent code formatting
- Keep dependencies up to date and audit for security vulnerabilities
- Implement proper environment configuration for different deployment stages
- Use React Developer Tools for debugging and performance analysis

## Common Patterns
- Higher-Order Components (HOCs) for cross-cutting concerns
- Render props pattern for component composition
- Compound components for related functionality
- Provider pattern for context-based state sharing
- Container/Presentational component separation
- Custom hooks for reusable logic extraction