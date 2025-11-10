import { IMessageBus } from "../sockets/messageBus";

export interface IQueue<T> {
    next(): Promise<void>;
    add(item: T): void;
    setHandler(handler: (data: T) => Promise<void>): void;
}