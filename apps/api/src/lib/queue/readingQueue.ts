export interface IReadingQueue {
    onReading(handler: (data: any) => Promise<void>): void;
    enqueue(data: any): void;
}