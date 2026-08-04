import { describe, expect, it } from 'vitest';
import { router } from 'dashboard/routes';

const resolvedLeaf = path => {
  const resolved = router.resolve(path);
  return {
    name: resolved.name,
    matchedNames: resolved.matched.map(record => record.name),
    leaf: resolved.matched.at(-1),
  };
};

describe('dashboard route resolution', () => {
  it.each([
    ['/app/accounts/1/dashboard', 'home'],
    [
      '/app/accounts/1/conversations/conv-demo-reception',
      'inbox_conversation',
    ],
    ['/app/accounts/1/contacts?page=1', 'contacts_dashboard_index'],
    [
      '/app/accounts/1/portals/portals_articles_index',
      'portals_index',
    ],
    ['/app/accounts/1/settings/general', 'general_settings_index'],
  ])('resolves %s to %s', (path, expectedName) => {
    const result = resolvedLeaf(path);

    expect(result.name).toBe(expectedName);
    expect(result.leaf?.components?.default).toBeTruthy();
  });
});
