import { ROLES } from "../types";

const ROLE_LEVELS: Record<string, number> = {
    [ROLES.SUPERADMIN]: 1,
    [ROLES.ADMIN]: 2,
    [ROLES.TECNICO]: 3,
    [ROLES.LECTOR]: 4,
};

export function hasPermission(currentRole: string, requiredRole: string): boolean {
    const currentLevel = ROLE_LEVELS[currentRole];
    const requiredLevel = ROLE_LEVELS[requiredRole];

    if (!currentLevel || !requiredLevel) return false;

    return currentLevel <= requiredLevel;
}