/**
 * React hooks for bindit - unified binding approach
 * 
 * Single `useBind` hook that handles all input types intelligently
 * Performance optimized with useSyncExternalStore
 */

import { 
  useCallback, 
  useMemo, 
  useSyncExternalStore, 
  useRef, 
  useState,
  useEffect,
  type ChangeEvent,
  type CompositionEvent,
  type FormEvent
} from 'react';
import { 
  BindingStore, 
  createBindingStore, 
  type BindingConfig
} from '../../core/src/index.js';

/**
 * Context for performance optimization and edge case handling
 */
interface InputContext {
  isComposing: boolean;
  lastValue: string;
  selectionStart: number | null;
  selectionEnd: number | null;
  platform: 'desktop' | 'android' | 'ios' | 'other';
  touched: boolean; // Track if user has interacted with this field
  submitAttempted: boolean; // Track if form submission was attempted
}

/**
 * Detect platform for input handling optimizations
 */
function detectPlatform(): 'desktop' | 'android' | 'ios' | 'other' {
  if (typeof navigator === 'undefined') return 'other';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/android/.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/windows|mac|linux/.test(userAgent)) return 'desktop';
  
  return 'other';
}

/**
 * Hook to create and manage a binding store
 */
export function useBindingStore(initialState?: Record<string, any>): BindingStore {
  const store = useMemo(() => createBindingStore(initialState), []);
  return store;
}

/**
 * Universal binding hook - handles all input types automatically
 * 
 * ✨ ZERO CONFIGURATION: Works perfectly across all platforms (desktop, mobile, IME)
 * without any developer intervention. All edge cases are handled automatically.
 * 
 * @example
 * // Text input
 * const name = useBind(store, 'name');
 * <input {...name.input} />
 * 
 * // Checkbox  
 * const agreed = useBind(store, 'agreed');
 * <input type="checkbox" {...agreed.checkbox} />
 * 
 * // Select
 * const country = useBind(store, 'country');
 * <select {...country.select}>...</select>
 * 
 * // Radio
 * const theme = useBind(store, 'theme');
 * <input type="radio" {...theme.radio('dark')} />
 */
export function useBind<T = any>(
  store: BindingStore,
  path: string,
  config?: BindingConfig<T>
) {
  // Core binding with reactive value
  const binding = useMemo(() => store.bind<T>(path, config), [store, path, config]);
  
  const value = useSyncExternalStore(
    useCallback((callback) => binding.subscribe(callback), [binding]),
    useCallback(() => binding.value, [binding]),
    useCallback(() => binding.value, [binding])
  );

  // Context for input handling
  const contextRef = useRef<InputContext>({
    isComposing: false,
    lastValue: String(value || ''),
    selectionStart: null,
    selectionEnd: null,
    platform: detectPlatform(),
    touched: false, // Start with untouched state
    submitAttempted: false // Start without submit attempt
  });

  // Determine if validation errors should be shown based on timing configuration
  const shouldShowValidation = useCallback(() => {
    const context = contextRef.current;
    const timing = config?.validationTiming || 'onTouch'; // Default to onTouch
    
    switch (timing) {
      case 'onChange':
        return true; // Always show errors immediately
      case 'onSubmit':
        return context.submitAttempted; // Only after submit attempt
      case 'onTouch':
      default:
        return context.touched; // Show after user interaction
    }
  }, [config?.validationTiming]);

  // Universal change handler with improved edge case handling
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = event.target;
    const context = contextRef.current;
    
    // Mark field as touched on first interaction
    if (!context.touched) {
      context.touched = true;
    }
    
    // Platform-specific composition handling
    const shouldIgnoreComposition = () => {
      if (!('selectionStart' in target)) return false;
      
      // On Android, we need to be more permissive with composition events
      // to allow proper text input including spaces at the end
      if (context.platform === 'android') {
        // Only ignore during active composition if the value hasn't changed
        return context.isComposing && target.value === context.lastValue;
      }
      
      // On iOS, composition events can be flaky, so we're more conservative
      if (context.platform === 'ios') {
        // Allow all changes during composition on iOS
        return false;
      }
      
      // Desktop: standard composition handling
      return context.isComposing;
    };
    
    // Don't update during IME composition (with platform-specific logic)
    if (shouldIgnoreComposition()) {
      return;
    }
    
    let newValue: any;
    
    // Determine value based on input type
    if (target.type === 'checkbox') {
      newValue = (target as HTMLInputElement).checked;
    } else if (target.type === 'radio') {
      newValue = (target as HTMLInputElement).checked ? target.value : binding.value;
    } else if (target.type === 'number') {
      const numValue = parseFloat(target.value);
      newValue = isNaN(numValue) ? 0 : numValue;
    } else {
      newValue = target.value;
    }
    
    // Store selection for cursor position restoration (text inputs only)
    if ('selectionStart' in target) {
      context.selectionStart = target.selectionStart;
      context.selectionEnd = target.selectionEnd;
      context.lastValue = target.value;
    }
    
    binding.setValue(newValue);
  }, [binding]);

  const handleCompositionStart = useCallback((event: CompositionEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const context = contextRef.current;
    context.isComposing = true;
    
    // Store the current value for comparison
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    context.lastValue = target.value;
  }, []);

  const handleCompositionEnd = useCallback((event: CompositionEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const context = contextRef.current;
    context.isComposing = false;
    
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    
    // Always update the value after composition ends to ensure
    // we capture the final composed text
    const finalValue = target.type === 'number' ? 
      parseFloat(target.value) || 0 : target.value;
      
    // Update the context
    context.lastValue = target.value;
    
    binding.setValue(finalValue as T);
  }, [binding]);

  // Enhanced input handler for better edge case support
  const handleInput = useCallback((event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const context = contextRef.current;
    
    // Mark as touched on input
    if (!context.touched) {
      context.touched = true;
    }
    
    // Handle input events that bypass onChange (especially on mobile)
    // This ensures we capture all character input including spaces at the end
    if (!context.isComposing) {
      const newValue = target.type === 'number' ? 
        parseFloat(target.value) || 0 : target.value;
      
      // Only update if the value actually changed
      if (newValue !== context.lastValue) {
        context.lastValue = target.value;
        binding.setValue(newValue as T);
      }
    }
  }, [binding]);

  // Handle focus to mark field as touched (for accessibility)
  const handleFocus = useCallback(() => {
    const context = contextRef.current;
    if (!context.touched) {
      context.touched = true;
    }
  }, []);

  // Handle blur for additional touch marking
  const handleBlur = useCallback(() => {
    const context = contextRef.current;
    context.touched = true;
  }, []);

  // Method to mark that form submission was attempted
  const markSubmitAttempted = useCallback(() => {
    contextRef.current.submitAttempted = true;
  }, []);

  // Restore cursor position after React re-render
  const inputRef = useCallback((element: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (!element || !('selectionStart' in element)) return;
    
    const context = contextRef.current;
    if (context.selectionStart !== null && context.selectionEnd !== null) {
      requestAnimationFrame(() => {
        try {
          element.setSelectionRange(context.selectionStart, context.selectionEnd);
        } catch (e) {
          // Ignore errors on non-text inputs
        }
      });
    }
  }, [value]);

  // Return object with different binding styles
  return {
    // Core binding properties
    value,
    setValue: binding.setValue,
    isValid: binding.isValid,
    error: binding.error,
    path: binding.path,
    touched: contextRef.current.touched, // Expose touched state
    submitAttempted: contextRef.current.submitAttempted, // Expose submit attempt state
    markSubmitAttempted, // Method to mark submit attempt
    
    // Text input binding (default) - enhanced for cross-platform compatibility
    input: {
      value: String(value || ''),
      onChange: handleChange,
      onInput: handleInput, // Additional input handler for mobile edge cases
      onFocus: handleFocus, // Mark as touched on focus
      onBlur: handleBlur, // Ensure touched on blur
      onCompositionStart: handleCompositionStart,
      onCompositionEnd: handleCompositionEnd,
      ref: inputRef,
      'data-testid': `input-${path}`,
      'aria-invalid': shouldShowValidation() ? !binding.isValid : false, // Use timing logic
      'aria-describedby': (shouldShowValidation() && binding.error) ? `${path}-error` : undefined
    },
    
    // Checkbox binding
    checkbox: {
      checked: Boolean(value),
      onChange: handleChange,
      onFocus: handleFocus, // Mark as touched on focus
      onBlur: handleBlur, // Ensure touched on blur
      'data-testid': `checkbox-${path}`,
      'aria-invalid': shouldShowValidation() ? !binding.isValid : false // Use timing logic
    },
    
    // Select binding
    select: {
      value: String(value || ''),
      onChange: handleChange,
      onFocus: handleFocus, // Mark as touched on focus
      onBlur: handleBlur, // Ensure touched on blur
      'data-testid': `select-${path}`,
      'aria-invalid': shouldShowValidation() ? !binding.isValid : false // Use timing logic
    },
    
    // Radio binding factory
    radio: (radioValue: any) => ({
      checked: value === radioValue,
      value: String(radioValue),
      onChange: handleChange,
      onFocus: handleFocus, // Mark as touched on focus
      onBlur: handleBlur, // Ensure touched on blur
      'data-testid': `radio-${path}-${radioValue}`,
      'aria-invalid': shouldShowValidation() ? !binding.isValid : false // Use timing logic
    }),
    
    // Textarea binding (same as input but explicit) - enhanced for cross-platform
    textarea: {
      value: String(value || ''),
      onChange: handleChange,
      onInput: handleInput, // Additional input handler for mobile edge cases
      onFocus: handleFocus, // Mark as touched on focus
      onBlur: handleBlur, // Ensure touched on blur
      onCompositionStart: handleCompositionStart,
      onCompositionEnd: handleCompositionEnd,
      ref: inputRef,
      'data-testid': `textarea-${path}`,
      'aria-invalid': shouldShowValidation() ? !binding.isValid : false, // Use timing logic
      'aria-describedby': (shouldShowValidation() && binding.error) ? `${path}-error` : undefined
    }
  };
}

/**
 * Form validation hook that checks all bindings
 */
export function useFormValidation(bindings: Array<{ isValid: boolean; error?: string }>): {
  isValid: boolean;
  errors: string[];
  firstError?: string;
} {
  const [validationState, setValidationState] = useState({
    isValid: true,
    errors: [] as string[],
    firstError: undefined as string | undefined
  });

  useEffect(() => {
    const errors = bindings
      .map(binding => binding.error)
      .filter((error): error is string => !!error);
    
    setValidationState({
      isValid: errors.length === 0,
      errors,
      firstError: errors[0]
    });
  }, [bindings]);

  return validationState;
}

/**
 * Multi-field binding hook for common patterns
 */
export function useMultiBind<T extends Record<string, any>>(
  store: BindingStore,
  paths: { [K in keyof T]: string },
  configs?: { [K in keyof T]?: BindingConfig<T[K]> }
) {
  return useMemo(() => {
    const result = {} as any;
    
    for (const key in paths) {
      const path = paths[key];
      const config = configs?.[key];
      result[key] = useBind(store, path, config);
    }
    
    return result as { [K in keyof T]: ReturnType<typeof useBind<T[K]>> };
  }, [store, paths, configs]);
}

/**
 * Re-exports from core
 */
export { 
  createBindingStore, 
  transformers, 
  validators,
  type Binding,
  type BindingConfig,
  type BindingStore
} from '../../core/src/index.js';
