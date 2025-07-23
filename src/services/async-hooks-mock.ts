// Browser-compatible mock for Node.js async_hooks module

export class AsyncLocalStorage {
  constructor() {
    // No-op constructor for browser compatibility
  }

  run(store: any, callback: (...args: any[]) => any, ...args: any[]): any {
    // No-op implementation - just call the callback
    return callback(...args);
  }

  getStore(): any {
    // No-op implementation - return undefined
    return undefined;
  }

  enterWith(store: any): void {
    // No-op implementation
  }

  exit(callback: (...args: any[]) => any, ...args: any[]): any {
    // No-op implementation - just call the callback
    return callback(...args);
  }

  disable(): void {
    // No-op implementation
  }
}

// Export other async_hooks APIs as no-ops if needed
export function createHook(options: any): any {
  return {
    enable: () => {},
    disable: () => {},
  };
}

export function executionAsyncId(): number {
  return 0;
}

export function triggerAsyncId(): number {
  return 0;
}