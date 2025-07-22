/**
 * Framework-agnostic two-way data binding engine for bindit
 * 
 * This core provides:
 * - Type-safe property binding
 * - Performance-optimized subscriptions
 * - Transformation and validation hooks
 * - Framework-agnostic state management
 */

export type BindingTransformer<T, U = T> = (value: T) => U;
export type BindingValidator<T> = (value: T) => boolean | string;
export type BindingSubscriber<T> = (value: T, path: string) => void;

export interface BindingConfig<T> {
  transform?: BindingTransformer<any, T>;
  validate?: BindingValidator<T>;
  debounce?: number;
  immediate?: boolean;
  validationTiming?: 'onTouch' | 'onSubmit' | 'onChange'; // When to show validation errors
}

export interface Binding<T> {
  readonly value: T;
  readonly path: string;
  readonly isValid: boolean;
  readonly error?: string;
  setValue(value: T): void;
  subscribe(callback: BindingSubscriber<T>): () => void;
  transform<U>(transformer: BindingTransformer<T, U>): Binding<U>;
}

/**
 * Core binding store that manages state and subscriptions
 */
export class BindingStore {
  private state: Record<string, any> = {};
  private subscribers = new Map<string, Set<BindingSubscriber<any>>>();
  private configs = new Map<string, BindingConfig<any>>();

  constructor(initialState: Record<string, any> = {}) {
    this.state = { ...initialState };
  }

  /**
   * Create a type-safe binding for a specific property path
   */
  bind<T>(path: string, config: BindingConfig<T> = {}): Binding<T> {
    this.configs.set(path, config);
    
    const store = this; // Capture reference to store
    
    return {
      get value(): T {
        return store.getValue(path);
      },
      
      path,
      
      get isValid(): boolean {
        const value = store.getValue<T>(path);
        const validator = config.validate;
        if (!validator) return true;
        
        const result = validator(value);
        return result === true;
      },
      
      get error(): string | undefined {
        const value = store.getValue<T>(path);
        const validator = config.validate;
        if (!validator) return undefined;
        
        const result = validator(value);
        return typeof result === 'string' ? result : undefined;
      },
      
      setValue: (value: T) => {
        store.setValue(path, value);
      },
      
      subscribe: (callback: BindingSubscriber<T>) => {
        return store.subscribe(path, callback);
      },
      
      transform: <U>(transformer: BindingTransformer<T, U>): Binding<U> => {
        const transformedPath = path + '_transformed';
        const transformedConfig: BindingConfig<U> = {
          transform: (val) => transformer(val as T),
          debounce: config.debounce,
          immediate: config.immediate,
          validationTiming: config.validationTiming
        };
        return this.bind<U>(transformedPath, transformedConfig);
      }
    };
  }

  /**
   * Get value at path with dot notation support
   */
  getValue<T>(path: string): T {
    return this.getNestedValue(this.state, path);
  }

  /**
   * Set value at path and notify subscribers
   */
  setValue<T>(path: string, value: T): void {
    const config = this.configs.get(path);
    let processedValue = value;

    // Apply transformation if configured
    if (config?.transform) {
      processedValue = config.transform(value);
    }

    // Validate if configured
    if (config?.validate) {
      const result = config.validate(processedValue);
      if (result !== true) {
        // Still set the value but mark as invalid
        this.setNestedValue(this.state, path, processedValue);
        this.notifySubscribers(path, processedValue);
        return;
      }
    }

    this.setNestedValue(this.state, path, processedValue);
    this.notifySubscribers(path, processedValue);
  }

  /**
   * Subscribe to changes at a specific path
   */
  subscribe<T>(path: string, callback: BindingSubscriber<T>): () => void {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }
    
    const pathSubscribers = this.subscribers.get(path)!;
    pathSubscribers.add(callback);

    // Return unsubscribe function
    return () => {
      pathSubscribers.delete(callback);
      if (pathSubscribers.size === 0) {
        this.subscribers.delete(path);
      }
    };
  }

  /**
   * Get the entire state (useful for debugging or serialization)
   */
  getState(): Record<string, any> {
    return { ...this.state };
  }

  /**
   * Batch multiple updates to reduce notifications
   */
  batch(updates: () => void): void {
    // TODO: Implement batching to collect multiple updates
    // and emit notifications only once at the end
    updates();
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }

  private notifySubscribers<T>(path: string, value: T): void {
    const subscribers = this.subscribers.get(path);
    if (subscribers) {
      subscribers.forEach(callback => callback(value, path));
    }
  }
}

/**
 * Create a new binding store instance
 */
export function createBindingStore(initialState?: Record<string, any>): BindingStore {
  return new BindingStore(initialState);
}

/**
 * Utility transformers for common use cases
 */
export const transformers = {
  /**
   * Transform string to number
   */
  toNumber: (value: string): number => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  },
  
  /**
   * Transform to uppercase
   */
  toUpperCase: (value: string): string => value.toUpperCase(),
  
  /**
   * Transform to lowercase  
   */
  toLowerCase: (value: string): string => value.toLowerCase(),
  
  /**
   * Trim whitespace
   */
  trim: (value: string): string => value.trim(),
  
  /**
   * Format as currency (basic)
   */
  toCurrency: (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }
};

/**
 * Utility validators for common use cases
 */
export const validators = {
  /**
   * Validate required field
   */
  required: <T>(value: T): boolean | string => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required';
    }
    return true;
  },
  
  /**
   * Validate email format
   */
  email: (value: string): boolean | string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Please enter a valid email address';
  },
  
  /**
   * Validate minimum length
   */
  minLength: (min: number) => (value: string): boolean | string => {
    return value.length >= min || `Must be at least ${min} characters`;
  },
  
  /**
   * Validate maximum length
   */
  maxLength: (max: number) => (value: string): boolean | string => {
    return value.length <= max || `Must be no more than ${max} characters`;
  },
  
  /**
   * Validate number range
   */
  range: (min: number, max: number) => (value: number): boolean | string => {
    return (value >= min && value <= max) || `Must be between ${min} and ${max}`;
  }
};
