// Mock for langsmith/traceable module

export function traceable<T extends (...args: any[]) => any>(
  fn: T,
  config?: any
): T {
  // Return the original function without tracing in browser
  return fn;
}