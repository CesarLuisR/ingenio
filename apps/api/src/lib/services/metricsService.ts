import prisma from "../../database/postgres.db";

const HOUR = 36e5;
const diffH = (a: Date, b: Date) => (b.getTime() - a.getTime()) / HOUR;

export async function calculateMachineMetrics(machineId: number) {
    const failures = await prisma.failure.findMany({
        where: { machineId },
        orderBy: { occurredAt: "asc" },
        include: { maintenance: true }
    });

    if (failures.length === 0) {
        return {
            availability: 100,
            reliability: 100,
            mtbf: null,
            mttr: null,
            mtta: null,
        };
    }

    const machine = await prisma.machine.findUnique({
        where: { id: machineId }
    });

    const now = new Date();
    const total = diffH(machine!.createdAt, now);

    let downtime = 0;

    const repaired = failures.filter(f => f.resolvedAt);
    const mttr = repaired.length
        ? repaired.reduce((a, f) => a + diffH(f.occurredAt, f.resolvedAt!), 0) / repaired.length
        : null;

    const attended = failures.filter(f => f.maintenance?.performedAt);
    const mtta = attended.length
        ? attended.reduce((a, f) => a + diffH(f.occurredAt, f.maintenance!.performedAt!), 0) / attended.length
        : null;

    let mtbf = null;
    if (failures.length > 1) {
        const gaps = [];
        for (let i = 1; i < failures.length; i++) {
            gaps.push(diffH(failures[i - 1].occurredAt, failures[i].occurredAt));
        }
        mtbf = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    }

    for (const f of failures) {
        downtime += diffH(f.occurredAt, f.resolvedAt ?? now);
    }

    const availability = total > 0 ? ((total - downtime) / total) * 100 : null;
    const reliability = mtbf && mttr ? (mtbf / (mtbf + mttr)) * 100 : null;

    return { availability, reliability, mtbf, mttr, mtta };
}

export async function calculateIngenioMetrics(ingenioId: number) {
    const failures = await prisma.failure.findMany({
        where: { ingenioId },
        orderBy: { occurredAt: "asc" },
        include: { maintenance: true }
    });

    if (failures.length === 0) {
        return {
            availability: 100,
            reliability: 100,
            mtbf: null,
            mttr: null,
            mtta: null,
        };
    }

    const ingenio = await prisma.ingenio.findUnique({
        where: { id: ingenioId }
    });

    const now = new Date();
    const total = diffH(ingenio!.createdAt, now);

    let downtime = 0;

    const repaired = failures.filter(f => f.resolvedAt);
    const mttr = repaired.length
        ? repaired.reduce((a, f) => a + diffH(f.occurredAt, f.resolvedAt!), 0) / repaired.length
        : null;

    const attended = failures.filter(f => f.maintenance?.performedAt);
    const mtta = attended.length
        ? attended.reduce((a, f) => a + diffH(f.occurredAt, f.maintenance!.performedAt!), 0) / attended.length
        : null;

    let mtbf = null;
    if (failures.length > 1) {
        const gaps = [];
        for (let i = 1; i < failures.length; i++) {
            gaps.push(diffH(failures[i - 1].occurredAt, failures[i].occurredAt));
        }
        mtbf = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    }

    for (const f of failures) {
        downtime += diffH(f.occurredAt, f.resolvedAt ?? now);
    }

    const availability = total > 0 ? ((total - downtime) / total) * 100 : null;
    const reliability = mtbf && mttr ? (mtbf / (mtbf + mttr)) * 100 : null;

    return { availability, reliability, mtbf, mttr, mtta };
}
