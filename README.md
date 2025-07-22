# 🔗 bindit

*Stop fighting with React forms. One hook to bind them all.*

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-green.svg)](https://reactjs.org/)
[![Size](https://img.shields.io/badge/Size-<3KB-success.svg)](#)

```bash
npm install @bindit/react @bindit/core
```

## 😤 The Old Way (React State Hell)

```tsx
// 😵‍💫 Multiple useState calls, scattered logic, lots of boilerplate
function MyForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(18);
  const [agreed, setAgreed] = useState(false);
  const [country, setCountry] = useState('US');
  const [theme, setTheme] = useState('light');
  
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
  
  const validateEmail = (value) => {
    if (!value.includes('@')) {
      setEmailError('Invalid email');
      return false;
    }
    setEmailError('');
    return true;
  };
  
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (touched.name) validateName(value);
  };
  
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) validateEmail(value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true });
    if (validateName(name) && validateEmail(email)) {
      console.log({ name, email, age, agreed, country, theme });
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
        onChange={handleEmailChange}
        onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
        style={{ borderColor: touched.email && emailError ? 'red' : '' }}
      />
      {touched.email && emailError && <div>{emailError}</div>}
      
      <input 
        type="number"
        value={age}
        onChange={(e) => setAge(Number(e.target.value))}
      />
      
      <input 
        type="checkbox"
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
      />
      
      <select value={country} onChange={(e) => setCountry(e.target.value)}>
        <option value="US">United States</option>
        <option value="CA">Canada</option>
      </select>
      
      <input 
        type="radio" 
        checked={theme === 'light'} 
        onChange={() => setTheme('light')} 
      />
      <input 
        type="radio" 
        checked={theme === 'dark'} 
        onChange={() => setTheme('dark')} 
      />
    </form>
  );
}
```

## 🚀 The New Way (bindit Magic)

```tsx
// ✨ One store, one hook, zero pain
import { useBindingStore, useBind, validators } from '@bindit/react';

function MyForm() {
  const store = useBindingStore({
    name: '', email: '', age: 18, agreed: false, country: 'US', theme: 'light'
  });
  
  // One hook handles everything!
  const name = useBind(store, 'name', { validate: validators.required });
  const email = useBind(store, 'email', { validate: validators.email });
  const age = useBind(store, 'age');
  const agreed = useBind(store, 'agreed');
  const country = useBind(store, 'country');
  const theme = useBind(store, 'theme');

  return (
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      console.log(store.getState()); 
    }}>
      <input {...name.input} />
      {name.error && <div>{name.error}</div>}
      
      <input {...email.input} type="email" />
      {email.error && <div>{email.error}</div>}
      
      <input {...age.input} type="number" />
      <input type="checkbox" {...agreed.checkbox} />
      
      <select {...country.select}>
        <option value="US">United States</option>
        <option value="CA">Canada</option>
      </select>
      
      <input type="radio" {...theme.radio('light')} />
      <input type="radio" {...theme.radio('dark')} />
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
- **Bundle size**: 5KB total

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

## 📦 Bundle Size
| Package | Size (gzipped) |
|---------|------|
| `@bindit/core` | 1.6KB |
| `@bindit/react` | 3.4KB |
| **Total** | **5.0KB** |

---

**Stop fighting React forms. Start building.** 🚀
