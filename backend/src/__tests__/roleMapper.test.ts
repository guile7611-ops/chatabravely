import assert from 'assert';
import { mapDatabaseRoleToFrontend, getRolePermissions, getMappedRolePayload } from '../utils/roleMapper';

function runRoleMapperContractTests() {
  console.log('🧪 Executando testes de contrato de mapeamento de roles (Express <-> Frontend)...');

  // 1. Mapeamento estrito de ADMIN / ADMINISTRATOR para "administrator"
  assert.strictEqual(mapDatabaseRoleToFrontend('ADMIN'), 'administrator');
  assert.strictEqual(mapDatabaseRoleToFrontend('admin'), 'administrator');
  assert.strictEqual(mapDatabaseRoleToFrontend('ADMINISTRATOR'), 'administrator');

  const adminPayload = getMappedRolePayload('ADMIN');
  assert.strictEqual(adminPayload.role, 'administrator');
  assert.deepStrictEqual(adminPayload.permissions, ['administrator', 'agent']);

  // 2. Mapeamento estrito de AGENT para "agent"
  assert.strictEqual(mapDatabaseRoleToFrontend('AGENT'), 'agent');
  assert.strictEqual(mapDatabaseRoleToFrontend('agent'), 'agent');

  const agentPayload = getMappedRolePayload('AGENT');
  assert.strictEqual(agentPayload.role, 'agent');
  assert.deepStrictEqual(agentPayload.permissions, ['agent']);

  // 3. Exceções estritas sem fallback em valores nulos ou inválidos
  assert.throws(() => mapDatabaseRoleToFrontend(null), /Role do usuário não foi definida/);
  assert.throws(() => mapDatabaseRoleToFrontend(undefined), /Role do usuário não foi definida/);
  assert.throws(() => mapDatabaseRoleToFrontend('INVALID_ROLE'), /Role desconhecida ou inválida/);

  console.log('✅ Todos os testes de contrato de role (ADMIN/AGENT) passaram com sucesso!');
}

runRoleMapperContractTests();
