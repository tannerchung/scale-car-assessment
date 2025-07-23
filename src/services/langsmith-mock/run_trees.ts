export function isRunTree(obj: any): boolean {
  return false;
}

export class RunTree {
  constructor(...args: any[]) {}
  async end(...args: any[]) {}
  async addChild(...args: any[]) {
    return new RunTree();
  }
  async post(...args: any[]) {}
}

export function convertToDottedOrderFormat(...args: any[]): any {
  return {};
}