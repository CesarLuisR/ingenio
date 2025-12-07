// lib/db.ts (o el nombre de tu archivo de conexión)
import { PrismaClient } from "@prisma/client";
import { requestContext } from "../lib/utils/ctxStorage";

// 1. Instancia Original (Raw)
const prismaOriginal = new PrismaClient();

// 2. Cliente Extendido con Auditoría
const prisma = prismaOriginal.$extends({
  query: {
    $allModels: {
      async update({ model, operation, args, query }) {
        const ctx = requestContext.getStore();

        // Si no hay usuario o es la tabla de logs, pasamos directo
        if (!ctx || model === 'AuditLog') {
          return query(args);
        }

        // Obtener estado anterior
        const previousData = await (prismaOriginal as any)[model].findUnique({
          where: args.where,
        });

        const result = await query(args);

        // Guardar Log
        (prismaOriginal as any).auditLog.create({
          data: {
            userId: ctx.user.id,
            ingenioId: ctx.user.ingenioId,
            action: 'UPDATE',
            entity: model,
            entityId: result.id,
            ip: ctx.ip,
            meta: previousData || {}, 
          },
        }).catch((err: any) => console.error(`[AuditLog Error] ${model}:`, err));

        return result;
      },

      async delete({ model, operation, args, query }) {
        const ctx = requestContext.getStore();
        if (!ctx || model === 'AuditLog') return query(args);

        const previousData = await (prismaOriginal as any)[model].findUnique({
          where: args.where,
        });

        const result = await query(args);

        (prismaOriginal as any).auditLog.create({
          data: {
            userId: ctx.user.id,
            ingenioId: ctx.user.ingenioId,
            action: 'DELETE',
            entity: model,
            entityId: previousData?.id,
            ip: ctx.ip,
            meta: previousData || {},
          },
        }).catch((err: any) => console.error(`[AuditLog Error] ${model}:`, err));

        return result;
      },

      async create({ model, operation, args, query }) {
         const ctx = requestContext.getStore();
         const result = await query(args);
         
         if (ctx && model !== 'AuditLog') {
             (prismaOriginal as any).auditLog.create({
                data: {
                    userId: ctx.user.id,
                    ingenioId: ctx.user.ingenioId,
                    action: 'CREATE',
                    entity: model,
                    entityId: result.id,
                    ip: ctx.ip,
                    meta: null 
                }
             }).catch((err: any) => console.error(`[AuditLog Error] ${model}:`, err));
         }
         return result;
      }
    },
  },
});

// --- Funciones Helpers (Adaptadas) ---

export async function connectPostgresWithRetry(
    retries = 10,
    delayMs = 2000
): Promise<void> {
    for (let i = 1; i <= retries; i++) {
        try {
            // Usamos prismaOriginal para la conexión inicial, es más seguro
            await prismaOriginal.$connect();
            console.log("✅ Connected to Postgres via Prisma");
            return;
        } catch (err: any) {
            console.warn(
                `⏳ Postgres not ready (attempt ${i}/${retries}): ${err.message}`
            );
            if (i === retries) throw err;
            await new Promise((res) => setTimeout(res, delayMs));
        }
    }
}

export async function clearDatabase() {
    // Usamos prismaOriginal para queries crudas de mantenimiento
    const tablenames = await prismaOriginal.$queryRaw<
        Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    for (const { tablename } of tablenames) {
        if (tablename !== "_prisma_migrations") {
            await prismaOriginal.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`);
        }
    }
}

// Exportamos el cliente EXTENDIDO por defecto
export default prisma;