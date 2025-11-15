import prisma from "../../database/postgres.db";

export async function createUsers() {
    const ingenio = await prisma.ingenio.findUnique({
        where: { id: 1 }
    });

    if (!ingenio) {
        await prisma.ingenio.create({
            data: {
                name: "Ingenio Principal",
                location: "Ubicación Desconocida",
                code: "ING001"
            },
        });
        console.log("✅ Ingenio creado: Ingenio Principal");
    }

    const admin = await prisma.user.findUnique({ where: { email: "admin@admin.com" } });
    if (!admin) {
        await prisma.user.create({
            data: {
                name: "admin",
                email: "admin@admin.com",
                role: "admin",
                passwordHash: "$2b$10$y9EfTvn5iCRn.QvFZO2mO.hwO3wPXXtYBNnu1ONsw5Tv8Og4Eo8ba", //
                ingenioId: 1
            },
        });
        console.log("✅ Usuario admin creado: ");
    } else {
        console.log("ℹ️ Usuario admin ya existe");
    }
}