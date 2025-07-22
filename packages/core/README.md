# bindit-core

Framework-agnostic two-way data binding engine.

## Installation

```bash
npm install bindit-core
```

## Usage

```typescript
import { BindingStore } from 'bindit-core';

const store = new BindingStore({ name: '', email: '' });

const nameBinding = store.bind('name');
nameBinding.setValue('John');
console.log(nameBinding.getValue()); // 'John'
```

## Features

- 🔧 Framework agnostic - works with any UI library
- 🎯 Type-safe with full TypeScript support
- 📦 Tiny bundle size (1.6KB gzipped)
- 🚀 High performance with efficient subscriptions
- 🎨 Dot notation support for nested objects
- ✅ Built-in validation and transformation

## Documentation

See the [main bindit repository](https://github.com/M4T1SS3/bindit) for full documentation and examples.
