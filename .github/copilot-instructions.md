# Copilot Instructions for bindit

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

**bindit** is a tiny, type-safe two-way data binding layer for React with a framework-agnostic core. 

## Key Principles

1. **Type Safety First**: All APIs should be strongly typed with TypeScript inference
2. **Performance Critical**: Target <3KB gzipped, minimize re-renders, use `useSyncExternalStore`
3. **Framework Agnostic Core**: The binding engine should work without React
4. **Edge Case Handling**: Support IME composition, rapid typing, mobile input quirks
5. **Composable**: Works with any state management (Zustand, Jotai, built-in React state)

## Architecture

- `packages/core/` - Framework-agnostic binding engine
- `packages/react/` - React hooks and components 
- `packages/adapters/` - Integrations with form libraries (React Hook Form, Zod)
- `examples/` - Demo applications showing usage patterns

## Code Style

- Use strict TypeScript configuration
- Prefer composition over inheritance
- Write performance-sensitive code with benchmarks
- Test edge cases (IME, rapid typing, mobile quirks)
- Keep bundle size minimal - tree-shake aggressively

## Testing Focus

- Unit tests for core binding logic
- React Testing Library for hooks
- Performance benchmarks for re-render optimization
- Edge case testing (composition events, rapid input, mobile)
- Browser compatibility testing
