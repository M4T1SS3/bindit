import { useState } from 'react';
import {
  useBindingStore,
  useBind,
  useFormValidation,
  validators,
  transformers
} from '../../../packages/react/src/index.js';

function App() {
  // Create a binding store with initial data
  const store = useBindingStore({
    name: '',
    email: '',
    age: 18,
    isSubscribed: true,
    country: 'US',
    theme: 'light',
    bio: '',
    edgeTest: '' // For edge case testing
  });

  // Universal bindings - one hook handles everything!
  const name = useBind(store, 'name', {
    validate: validators.required,
    transform: transformers.trim,
    validationTiming: 'onTouch' // Show errors after user interaction (default)
  });

  const email = useBind(store, 'email', {
    validate: (value: string) => {
      const required = validators.required(value);
      if (required !== true) return required;
      return validators.email(value);
    },
    validationTiming: 'onChange' // Show errors immediately as user types
  });

  const age = useBind(store, 'age', {
    transform: transformers.toNumber,
    validate: validators.range(13, 120),
    validationTiming: 'onSubmit' // Only show errors after submit attempt
  });

  const subscription = useBind(store, 'isSubscribed');
  const country = useBind(store, 'country');
  const theme = useBind(store, 'theme');
  const bio = useBind(store, 'bio', {
    validate: validators.maxLength(500),
    validationTiming: 'onTouch' // Show errors after user interaction
  });

  // Edge case testing field
  const edgeTest = useBind(store, 'edgeTest', {
    // No validation to allow any input for testing
  });

  // Form validation - consider validation timing
  const validation = useFormValidation([
    { isValid: name.isValid, error: name.error },
    { isValid: email.isValid, error: email.error },
    { isValid: age.isValid, error: age.error },
    { isValid: bio.isValid, error: bio.error }
  ]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as submit attempted for onSubmit validation timing
    name.markSubmitAttempted();
    email.markSubmitAttempted();
    age.markSubmitAttempted();
    bio.markSubmitAttempted();
    
    if (validation.isValid) {
      alert('Form submitted! Check console for data.');
      console.log('Form data:', store.getState());
    } else {
      alert('Please fix validation errors before submitting.');
    }
  };

  // State for demo features
  const [showJson, setShowJson] = useState(false);
  const [rapidTestActive, setRapidTestActive] = useState(false);

  // Rapid typing test
  const handleRapidTest = () => {
    setRapidTestActive(true);
    const testString = "The quick brown fox jumps over the lazy dog. This tests rapid input handling!";
    
    let i = 0;
    const interval = setInterval(() => {
      if (i <= testString.length) {
        store.setValue('name', testString.substring(0, i));
        i++;
      } else {
        clearInterval(interval);
        setRapidTestActive(false);
      }
    }, 50);
  };

  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: theme.value === 'dark' ? '#1a1a1a' : '#ffffff',
      color: theme.value === 'dark' ? '#ffffff' : '#000000',
      minHeight: '100vh'
    }}>
      <h1>🔗 bindit Demo</h1>
      <p>A tiny, type-safe two-way data binding layer for React</p>

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <h2>User Profile Form</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* Name Input - Universal binding! */}
            <div>
              <label htmlFor="name">Name * <span style={{ fontSize: '12px', color: '#666' }}>(validates onTouch)</span></label>
              <input
                id="name"
                type="text"
                {...name.input}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `2px solid ${(name.touched && !name.isValid) ? '#e74c3c' : '#ddd'}`,
                  borderRadius: '4px'
                }}
                placeholder="Enter your name"
              />
              {name.touched && name.error && (
                <div style={{ color: '#e74c3c', fontSize: '14px' }}>
                  {name.error}
                </div>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email">Email * <span style={{ fontSize: '12px', color: '#666' }}>(validates onChange)</span></label>
              <input
                id="email"
                type="email"
                {...email.input}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `2px solid ${email.error ? '#e74c3c' : '#ddd'}`,
                  borderRadius: '4px'
                }}
                placeholder="Enter your email"
              />
              {email.error && (
                <div style={{ color: '#e74c3c', fontSize: '14px' }}>
                  {email.error}
                </div>
              )}
            </div>

            {/* Age Input */}
            <div>
              <label htmlFor="age">Age <span style={{ fontSize: '12px', color: '#666' }}>(validates onSubmit)</span></label>
              <input
                id="age"
                type="number"
                {...age.input}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `2px solid ${(age.submitAttempted && !age.isValid) ? '#e74c3c' : '#ddd'}`,
                  borderRadius: '4px'
                }}
                min="13"
                max="120"
              />
              {age.submitAttempted && age.error && (
                <div style={{ color: '#e74c3c', fontSize: '14px' }}>
                  {age.error}
                </div>
              )}
            </div>

            {/* Subscription Checkbox - Same useBind hook! */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" {...subscription.checkbox} />
                Subscribe to newsletter
              </label>
            </div>

            {/* Country Select - Same useBind hook! */}
            <div>
              <label htmlFor="country">Country</label>
              <select
                id="country"
                {...country.select}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '2px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
              </select>
            </div>

            {/* Theme Radio Buttons - Same useBind hook! */}
            <div>
              <label>Theme</label>
              <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="radio" {...theme.radio('light')} />
                  Light
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="radio" {...theme.radio('dark')} />
                  Dark
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="radio" {...theme.radio('auto')} />
                  Auto
                </label>
              </div>
            </div>

            {/* Bio Textarea - Same useBind hook! */}
            <div>
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                {...bio.textarea}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `2px solid ${(bio.touched && !bio.isValid) ? '#e74c3c' : '#ddd'}`,
                  borderRadius: '4px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Tell us about yourself..."
              />
              <div style={{ fontSize: '12px', color: '#666' }}>
                {String(bio.value || '').length}/500 characters
              </div>
              {bio.touched && bio.error && (
                <div style={{ color: '#e74c3c', fontSize: '14px' }}>
                  {bio.error}
                </div>
              )}
            </div>

            {/* Form Status */}
            <div style={{
              padding: '10px',
              borderRadius: '4px',
              backgroundColor: validation.isValid ? '#d4edda' : '#f8d7da',
              color: validation.isValid ? '#155724' : '#721c24',
              border: `1px solid ${validation.isValid ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              <strong>Form Status:</strong> {validation.isValid ? 'Valid ✓' : 'Invalid ✗'}
              {validation.firstError && <div>First error: {validation.firstError}</div>}
            </div>

            <button
              type="submit"
              disabled={!validation.isValid}
              style={{
                padding: '10px 20px',
                backgroundColor: validation.isValid ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: validation.isValid ? 'pointer' : 'not-allowed'
              }}
            >
              Submit Form
            </button>
          </form>
        </div>

        <div>
          <h2>🚀 Universal Binding Demo</h2>
          
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
            <h3>✨ One Hook to Rule Them All</h3>
            <code style={{ fontSize: '12px', backgroundColor: '#fff', padding: '4px 8px', borderRadius: '4px', display: 'block', marginTop: '8px' }}>
              {`const field = useBind(store, 'path');`}
            </code>
            <ul style={{ fontSize: '14px', marginTop: '10px', lineHeight: '1.6' }}>
              <li><code>{'<input {...field.input} />'}</code></li>
              <li><code>{'<input type="checkbox" {...field.checkbox} />'}</code></li>
              <li><code>{'<select {...field.select} />'}</code></li>
              <li><code>{'<input type="radio" {...field.radio("value")} />'}</code></li>
              <li><code>{'<textarea {...field.textarea} />'}</code></li>
            </ul>
          </div>

          {/* Validation Timing Demo */}
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
            <h3>🎯 Validation Timing Options</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p><strong>Choose when to show validation errors:</strong></p>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li><code>onTouch</code> - After user focuses/interacts (default)</li>
                <li><code>onChange</code> - Immediately as user types</li>
                <li><code>onSubmit</code> - Only after form submission attempt</li>
              </ul>
              <code style={{ fontSize: '11px', backgroundColor: '#fff', padding: '4px 6px', borderRadius: '3px', display: 'block', marginTop: '8px' }}>
                {`useBind(store, 'field', { validationTiming: 'onSubmit' })`}
              </code>
            </div>
          </div>
          
          {/* Rapid Typing Test */}
          <div style={{ marginBottom: '20px' }}>
            <h3>🏃‍♂️ Rapid Typing Test</h3>
            <p>Tests performance with rapid input changes (edge case handling)</p>
            <button
              onClick={handleRapidTest}
              disabled={rapidTestActive}
              style={{
                padding: '10px 15px',
                backgroundColor: rapidTestActive ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: rapidTestActive ? 'not-allowed' : 'pointer'
              }}
            >
              {rapidTestActive ? 'Testing...' : 'Start Rapid Test'}
            </button>
          </div>

          {/* Edge Case Testing */}
          <div style={{ marginBottom: '20px' }}>
            <h3>🔧 Cross-Platform Input Testing</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p><strong>Test these scenarios (bindit handles all platforms automatically):</strong></p>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Type text, then add spaces at the END of the input</li>
                <li>Use different keyboards (mobile, desktop, IME)</li>
                <li>Type rapidly while composing text</li>
                <li>Copy/paste text with trailing spaces</li>
                <li>Use backspace to delete trailing spaces</li>
              </ul>
              
              {/* Edge Case Test Input */}
              <div style={{ margin: '10px 0' }}>
                <input
                  {...edgeTest.input}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '2px solid #007bff',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  placeholder="🧪 Try typing here! Works perfectly on any device/keyboard..."
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Value: "{edgeTest.value}" (Length: {(edgeTest.value as string || '').length}) • Touched: {edgeTest.touched ? '✅' : '❌'}
                </div>
              </div>
              
              <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#e8f5e8', borderRadius: '4px', border: '1px solid #c3e6cb' }}>
                <p style={{ margin: '0', fontSize: '12px' }}>
                  ✨ <strong>Zero Configuration:</strong> bindit automatically handles IME composition, mobile keyboards, 
                  rapid typing, and cursor position across all platforms without any developer intervention.
                </p>
              </div>
            </div>
          </div>

          {/* JSON Viewer */}
          <div>
            <h3>📊 Live Data</h3>
            <button
              onClick={() => setShowJson(!showJson)}
              style={{
                padding: '5px 10px',
                marginBottom: '10px',
                backgroundColor: '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showJson ? 'Hide' : 'Show'} JSON
            </button>
            
            {showJson && (
              <pre style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                border: '1px solid #dee2e6',
                color: '#000'
              }}>
                {JSON.stringify(store.getState(), null, 2)}
              </pre>
            )}
          </div>

          {/* Performance Info */}
          <div style={{ marginTop: '20px' }}>
            <h3>⚡ Key Features</h3>
            <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <li><strong>Universal API:</strong> One hook for all input types</li>
              <li><strong>Zero Config:</strong> Works perfectly on any platform automatically</li>
              <li><strong>Smart Validation:</strong> Only shows errors after user interaction</li>
              <li><strong>Performance Optimized:</strong> Granular updates, cursor preservation</li>
              <li><strong>Type Safe:</strong> Full TypeScript inference and validation</li>
              <li><strong>Edge Case Handling:</strong> IME, rapid typing, mobile keyboards - all handled</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
