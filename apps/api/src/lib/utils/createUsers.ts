import { UserRole } from "@prisma/client";
import prisma from "../../database/postgres.db";

export async function createUsers() {
    // --------------------------------------------
    // 1. Crear Ingenio si no existe
    // --------------------------------------------
    let ingenio = await prisma.ingenio.findUnique({
        where: { id: 1 }
    });

    if (!ingenio) {
        ingenio = await prisma.ingenio.create({
            data: {
                name: "Ingenio de Cesar",
                location: "Ubicación Desconocida",
                code: "ING001"
            },
        });

        console.log("✅ Ingenio creado: Ingenio de Cesar");
    } else {
        console.log("ℹ️ Ingenio ya existe");
    }


    // --------------------------------------------
    // 2. Crear Machine base si no existe
    // --------------------------------------------
    const machineExists = await prisma.machine.findFirst({
        where: { ingenioId: ingenio.id }
    });

    let machine;

    if (!machineExists) {
        machine = await prisma.machine.create({
            data: {
                name: "Máquina Principal",
                code: "MACH-001",
                // description: "Máquina inicial del sistema",
                location: "Zona General",
                ingenioId: ingenio.id
            }
        });

        console.log("✅ Máquina creada: Máquina Principal");
    } else {
        machine = machineExists;
        console.log("ℹ️ Máquina ya existe:", machine.name);
    }


    // --------------------------------------------
    // 3. Crear usuario admin si no existe
    // --------------------------------------------
    const admin = await prisma.user.findUnique({
        where: { email: "admin@admin.com" }
    });

    if (!admin) {
        await prisma.user.create({
            data: {
                name: "admin",
                email: "admin@admin.com",
                role: UserRole.ADMIN,
                passwordHash:
                    "$2b$10$y9EfTvn5iCRn.QvFZO2mO.hwO3wPXXtYBNnu1ONsw5Tv8Og4Eo8ba",
                ingenioId: ingenio.id
            },
        });

        console.log("✅ Usuario admin creado");
    } else {
        console.log("ℹ️ Usuario admin ya existe");
    }


    // --------------------------------------------
    // 4. Crear usuario superadmin si no existe
    // --------------------------------------------
    const superadmin = await prisma.user.findUnique({
        where: { email: "superadmin@admin.com" }
    });

    if (!superadmin) {
        await prisma.user.create({
            data: {
                name: "superadmin",
                email: "superadmin@admin.com",
                role: UserRole.SUPERADMIN,
                passwordHash:
                    "$2b$10$y9EfTvn5iCRn.QvFZO2mO.hwO3wPXXtYBNnu1ONsw5Tv8Og4Eo8ba",
                ingenioId: null 
            },
        });

        console.log("✅ Usuario superadmin creado");
    } else {
        console.log("ℹ️ Usuario superadmin ya existe");
    }


    // --------------------------------------------
    // LOG FINAL
    // --------------------------------------------
    console.log("🎉 Setup inicial completado.");
}
