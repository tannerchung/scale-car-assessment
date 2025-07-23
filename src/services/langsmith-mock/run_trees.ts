// Mock for langsmith/run_trees module

export class RunTree {
  constructor(config?: any) {
    // No-op constructor
  }

  async end(): Promise<void> {
    // No-op implementation
  }

  async patch(data: any): Promise<void> {
    // No-op implementation
  }
}

export function convertToDottedOrderFormat(data: any): any {
  // No-op implementation
  return data;
}

export function isRunTree(obj: any): boolean {
  // Mock implementation - always returns false since we're disabling tracing
  return false;
}