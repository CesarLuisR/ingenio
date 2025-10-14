export interface IMessageBus {
    publish(event: string, payload: any): void;
}