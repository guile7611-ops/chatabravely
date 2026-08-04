import { describe, it, expect, vi } from 'vitest';
import store from '../index';

describe('Vuex Store Initialization (No Duplicate Getter Warnings)', () => {
  it('instantiates the complete real Vuex store without emitting duplicate getter key warnings', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(store).toBeDefined();
    expect(store.getters).toBeDefined();

    // Confirmar que nenhum aviso de [vuex] duplicate getter key foi emitido
    const duplicateGetterCalls = consoleErrorSpy.mock.calls.filter(call =>
      call[0]?.includes?.('[vuex] duplicate getter key')
    );
    const duplicateGetterWarnCalls = consoleWarnSpy.mock.calls.filter(call =>
      call[0]?.includes?.('[vuex] duplicate getter key')
    );

    expect(duplicateGetterCalls).toHaveLength(0);
    expect(duplicateGetterWarnCalls).toHaveLength(0);

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });
});
