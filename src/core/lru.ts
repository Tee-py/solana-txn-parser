class LRUNode<V> {
    key: string;
    value: V;
    prev: LRUNode<V> | null = null;
    next: LRUNode<V> | null = null;

    constructor(key: string, value: V) {
        this.key = key;
        this.value = value;
    }
}

export class LRUCache<V> {
    private capacity: number;
    private cache: Map<string, LRUNode<V>>;
    head: LRUNode<V> | null = null;
    tail: LRUNode<V> | null = null;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cache = new Map();
    }

    get(key: string): V | null {
        const node = this.cache.get(key);
        if (!node) return null;

        this.moveToFront(node);
        return node.value;
    }

    set(key: string, value: V): void {
        if (this.cache.has(key)) {
            const node = this.cache.get(key)!;
            node.value = value;
            this.moveToFront(node);
            return;
        }

        const newNode = new LRUNode(key, value);
        if (this.cache.size >= this.capacity) {
            if (this.tail) {
                this.cache.delete(this.tail.key);
                this.removeNode(this.tail);
            }
        }

        this.cache.set(key, newNode);
        this.addToFront(newNode);
    }

    private moveToFront(node: LRUNode<V>): void {
        this.removeNode(node);
        this.addToFront(node);
    }

    private removeNode(node: LRUNode<V>): void {
        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;
        if (node === this.head) this.head = node.next;
        if (node === this.tail) this.tail = node.prev;
    }

    private addToFront(node: LRUNode<V>): void {
        node.prev = null;
        node.next = this.head;

        if (this.head) this.head.prev = node;
        this.head = node;

        if (!this.tail) this.tail = node;
    }

    clear(): void {
        this.cache.clear();
        this.head = null;
        this.tail = null;
    }

    get size(): number {
        return this.cache.size;
    }
}
