import { AsyncLocalStorage } from 'node:async_hooks';
import { SessionUser } from '../../types/global';

// Definimos qué vamos a guardar en el contexto
export interface RequestContext {
  user: SessionUser;
  ip: string;
}

// Creamos el almacén global (es nativo de Node.js, muy rápido)
export const requestContext = new AsyncLocalStorage<RequestContext>();