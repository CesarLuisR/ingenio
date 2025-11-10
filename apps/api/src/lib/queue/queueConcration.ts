import { IQueue } from "./IQueue";

export default class Queue<T> implements IQueue<T> {
    private items: T[] = [];
    private limit: number = 100;
    private isProcessing: boolean = false;
    private handler: ((data: T) => Promise<void>) | null = null;

    constructor(limit: number = 100) {
        this.limit = limit;
    }

    public setHandler(handler: (data: T) => Promise<void>) {
        this.handler = handler;
    }

    async next(): Promise<void> {
        if (this.isProcessing || !this.handler) return;
        this.isProcessing = true;

        try {
            const item = this.items.shift();
            if (item)
                await this.handler(item);
        } catch (error) {
            console.error("Error processing queue item:", error);
        } finally {
            this.isProcessing = false;
            if (this.items.length > 0)
                queueMicrotask(() => this.next());
        }
    }

    add(item: any): void {
        if (this.items.length === this.limit) {
            console.warn("Queue limit reached, cannot add more items.");
            return;
        }

        this.items.push(item);
        this.next();
    }
}