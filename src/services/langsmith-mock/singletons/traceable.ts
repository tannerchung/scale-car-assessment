// Mock for langsmith/singletons/traceable module

export function getCurrentRunTree(): any {
  // No-op implementation
  return null;
}

export function traceable<T extends (...args: any[]) => any>(
  fn: T,
  config?: any
): T {
  // Return the original function without tracing in browser
  return fn;
}

export function isTraceableFunction(fn: any): boolean {
  // Mock implementation - always returns false
  return false;
}