/**
 * Mapeador Único de Roles entre o Banco de Dados PostgreSQL (Abravely Express)
 * e o Padrão do Frontend (Chatwoot Vue)
 */

export type FrontendRole = 'administrator' | 'agent';

export interface MappedRolePayload {
  role: FrontendRole;
  permissions: FrontendRole[];
}

export function mapDatabaseRoleToFrontend(dbRole: string | null | undefined): FrontendRole {
  if (!dbRole) {
    throw new Error('Role do usuário não foi definida no banco de dados.');
  }

  const normalized = dbRole.trim().toUpperCase();

  if (normalized === 'ADMIN' || normalized === 'ADMINISTRATOR') {
    return 'administrator';
  }

  if (normalized === 'AGENT') {
    return 'agent';
  }

  throw new Error(`Role desconhecida ou inválida no banco de dados: "${dbRole}"`);
}

export function getRolePermissions(role: FrontendRole): FrontendRole[] {
  if (role === 'administrator') {
    return ['administrator', 'agent'];
  }
  return ['agent'];
}

export function getMappedRolePayload(dbRole: string | null | undefined): MappedRolePayload {
  const role = mapDatabaseRoleToFrontend(dbRole);
  const permissions = getRolePermissions(role);
  return { role, permissions };
}
