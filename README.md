# 🔗 bindit

*Stop fighting with React forms. One hook to bind them all.*

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-green.svg)](https://reactjs.org/)
[![Size](https://img.shields.io/badge/Size-5.6KB-success.svg)](#)

```bash
npm install bindit-react bindit-core
```

## 😤 The Old Way (React State Hell)

```tsx
// 😵‍💫 Multiple useState calls, scattered logic, lots of boilerplate
function MyForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState({});
  
  const validateName = (value) => {
    if (!value.trim()) {
      setNameError('Name is required');
      return false;
    }
    setNameError('');
    return true;
  };
  
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (touched.name) validateName(value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true });
    if (validateName(name) && validateEmail(email)) {
      console.log({ name, email });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={name}
        onChange={handleNameChange}
        onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
        style={{ borderColor: touched.name && nameError ? 'red' : '' }}
      />
      {touched.name && nameError && <div>{nameError}</div>}
      
      <input 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        // ... more validation logic
      />
      {touched.email && emailError && <div>{emailError}</div>}
    </form>
  );
}
```

## 🚀 The New Way (bindit Magic)

```tsx
// ✨ One store, one hook, zero pain
import { useBindingStore, useBind, validators } from 'bindit-react';

function MyForm() {
  const store = useBindingStore({ name: '', email: '' });
  
  // One hook handles everything!
  const name = useBind(store, 'name', { validate: validators.required });
  const email = useBind(store, 'email', { validate: validators.email });

  return (
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      console.log(store.getState()); 
    }}>
      <input {...name.input} />
      {name.error && <div>{name.error}</div>}
      
      <input {...email.input} type="email" />
      {email.error && <div>{email.error}</div>}
    </form>
  );
}
```

**90% less code. 100% more features. TypeScript included. 🎯**

## 🎯 More Examples (Because Examples > Words)

### Different Validation Timing
```tsx
// Show errors immediately (good for email validation)
const email = useBind(store, 'email', { 
  validate: validators.email,
  validationTiming: 'onChange' 
});

// Show errors after focus (good for required fields)  
const name = useBind(store, 'name', { 
  validate: validators.required,
  validationTiming: 'onTouch' 
});

// Show errors only on submit (good for optional fields)
const bio = useBind(store, 'bio', { 
  validate: validators.maxLength(500),
  validationTiming: 'onSubmit' 
});
```

### Complex Nested Data
```tsx
const store = useBindingStore({
  user: {
    profile: { name: '', email: '' },
    settings: { theme: 'light', notifications: true }
  }
});

const name = useBind(store, 'user.profile.name');
const theme = useBind(store, 'user.settings.theme');

// Just works with dot notation!
<input {...name.input} />
<input type="radio" {...theme.radio('dark')} />
```

### Built-in Validators & Transformers
```tsx
const age = useBind(store, 'age', {
  transform: transformers.toNumber,
  validate: validators.range(13, 120)
});

const username = useBind(store, 'username', {
  transform: transformers.trim,
  validate: validators.minLength(3)
});

const email = useBind(store, 'email', {
  validate: validators.email
});
```

### All Input Types Work the Same Way
```tsx
const field = useBind(store, 'anything');

// Pick your input type:
<input {...field.input} />                    // Text
<input type="email" {...field.input} />       // Email  
<input type="password" {...field.input} />    // Password
<input type="number" {...field.input} />      // Number
<textarea {...field.textarea} />              // Textarea
<input type="checkbox" {...field.checkbox} /> // Checkbox
<input type="radio" {...field.radio('val')} />// Radio
<select {...field.select} />                  // Select
```

## 🧠 How It Works (So Simple Even Your Cat Gets It)

### 1. Create a Store
```tsx
const store = useBindingStore({ name: '', email: '' });
// That's your entire state. Nested objects? Works. Arrays? Works.
```

### 2. Bind to Inputs  
```tsx
const name = useBind(store, 'name');
// One hook creates everything you need for any input type
```

### 3. Spread and Forget
```tsx
<input {...name.input} />
// All events, validation, error states handled automatically
```

### Behind the Scenes Magic ✨
- **Type-safe**: Full TypeScript inference 
- **Cross-platform**: Works on mobile, desktop, any keyboard
- **Performance**: Only re-renders what changed
- **Validation**: Smart timing (touch, change, submit)
- **Edge cases**: IME, rapid typing, cursor position - all handled
- **Bundle size**: 5.6KB total

### Available Validators
```tsx
validators.required        // Not empty
validators.email          // Valid email
validators.minLength(n)   // Min length
validators.maxLength(n)   // Max length  
validators.range(min,max) // Number range
validators.pattern(regex) // Custom regex
```

### Available Transformers
```tsx
transformers.trim         // Remove whitespace
transformers.toNumber     // Convert to number
transformers.toLowerCase  // Convert to lowercase
transformers.toUpperCase  // Convert to uppercase
```

### Custom Validators & Transformers

**Write your own validators:**
```tsx
// Custom validator function
const isStrongPassword = (value: string): boolean | string => {
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(value)) return 'Password must contain uppercase letter';
  if (!/[0-9]/.test(value)) return 'Password must contain a number';
  return true;
};

// Use it with useBind
const password = useBind(store, 'password', { 
  validate: isStrongPassword 
});

// Combine multiple validators
const email = useBind(store, 'email', {
  validate: createValidator.all(
    validators.required,
    validators.email,
    (value) => !value.includes('+') || 'No + symbols allowed'
  )
});
```

**Write your own transformers:**
```tsx
// Custom transformer function
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length >= 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6,10)}`;
  }
  return value;
};

// Use it with useBind
const phone = useBind(store, 'phone', { 
  transform: formatPhoneNumber 
});

// Chain multiple transformers
const username = useBind(store, 'username', {
  transform: createTransformer.chain(
    transformers.trim,
    transformers.toLowerCase
  )
});
```

## 📦 Bundle Size
| Package | Size (gzipped) |
|---------|------|
| `bindit-core` | 1.9KB |
| `bindit-react` | 3.7KB |
| **Total** | **5.6KB** |

---

**Stop fighting React forms. Start building.** 🚀
