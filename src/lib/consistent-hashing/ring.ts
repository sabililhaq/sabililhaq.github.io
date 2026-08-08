export interface Node {
  id: string;
  hash: number;
}

export interface Key {
  id: string;
  hash: number;
  owner: string;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  // Map to 0 → 360 for easy degrees on the ring
  return Math.abs(hash) % 360;
}

export class HashRing {
  nodes: Node[] = [];
  keys: Key[] = [];

  addNode(id: string) {
    if (this.nodes.find((n) => n.id === id)) return;
    const hash = simpleHash(id);
    this.nodes.push({ id, hash });
    this.nodes.sort((a, b) => a.hash - b.hash);
    this.reassignKeys();
  }

  removeNode(id: string) {
    this.nodes = this.nodes.filter((n) => n.id !== id);
    this.reassignKeys();
  }

  addKey(id: string) {
    if (this.keys.find((k) => k.id === id)) return;
    const hash = simpleHash(id);
    const owner = this.findOwner(hash);
    this.keys.push({ id, hash, owner });
  }

  addRandomKeys(count: number) {
    for (let i = 0; i < count; i++) {
      const id = `key-${Math.random().toString(36).slice(2, 8)}`;
      this.addKey(id);
    }
  }

  clearKeys() {
    this.keys = [];
  }

  private findOwner(keyHash: number): string {
    if (this.nodes.length === 0) return '';

    // Find the first node clockwise (higher hash)
    for (const node of this.nodes) {
      if (node.hash >= keyHash) return node.id;
    }
    // Wrap around
    return this.nodes[0].id;
  }

  private reassignKeys() {
    this.keys = this.keys.map((key) => ({
      ...key,
      owner: this.findOwner(key.hash),
    }));
  }

  getLoad(): Record<string, number> {
    const load: Record<string, number> = {};
    this.nodes.forEach((n) => (load[n.id] = 0));
    this.keys.forEach((k) => {
      if (load[k.owner] !== undefined) load[k.owner]++;
    });
    return load;
  }
}
