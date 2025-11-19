import { UserRole } from "@prisma/client";

export const ROLES = {
    [UserRole.SUPERADMIN]: 1,
    [UserRole.ADMIN]: 2,
    [UserRole.TECNICO]: 3,
    [UserRole.LECTOR]: 4
}

export default function hasPermission(
    userRole: UserRole,
    required: UserRole,
    ids?: {
        user: number,
        element: number
    }
): boolean {
    if (ids?.user !== ids?.element) return false;

    const currentRole = ROLES[userRole];
    if (currentRole <= ROLES[required]) return true;

    return false;
}
