export interface IMessageBus {
    publish(event: string, payload: any): void;
    publishToIngenio(event: string, payload: any, ingenioId: number): void;
}