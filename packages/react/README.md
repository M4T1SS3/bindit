# bindit-react

React hooks for bindit two-way data binding.

## Installation

```bash
npm install bindit-react bindit-core
```

## Quick Start

```tsx
import { useBindingStore, useBind } from 'bindit-react';

function MyForm() {
  const store = useBindingStore({ name: '', email: '' });
  const name = useBind(store, 'name');
  const email = useBind(store, 'email');

  return (
    <form>
      <input {...name.input} placeholder="Name" />
      <input {...email.input} type="email" placeholder="Email" />
    </form>
  );
}
```

## Features

- 🎯 Universal API - one hook for all input types
- 🔧 Built-in validation with smart timing
- 📱 Cross-platform input handling (mobile, desktop)
- ⚡ Performance optimized with `useSyncExternalStore`
- 🎨 TypeScript inference for perfect autocomplete
- 📦 Small bundle size (3.4KB gzipped)

## API

### useBind(store, path, config?)

Creates a binding for any input type:

```tsx
const field = useBind(store, 'user.name', {
  validate: validators.required,
  validationTiming: 'onTouch' // 'onTouch' | 'onChange' | 'onSubmit'
});

// Use with any input:
<input {...field.input} />
<textarea {...field.textarea} />
<input type="checkbox" {...field.checkbox} />
<input type="radio" {...field.radio('value')} />
<select {...field.select} />
```

## Documentation

See the [main bindit repository](https://github.com/M4T1SS3/bindit) for full documentation and examples.
