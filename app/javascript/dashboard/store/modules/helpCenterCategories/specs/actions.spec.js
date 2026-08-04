import axios from 'axios';
import * as types from '../../../mutation-types';
import { actions } from '../actions';

global.axios = axios;
vi.mock('axios');

const category = { id: 'category-1', name: 'Primeiros passos', slug: 'primeiros-passos' };

describe('helpCenterCategories actions', () => {
  const commit = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  it('loads categories from the Abravely API', async () => {
    axios.get.mockResolvedValue({ data: { categories: [category] } });

    await expect(actions.index({ commit })).resolves.toEqual([category.id]);

    expect(axios.get).toHaveBeenCalledWith('/api/v1/help/categories');
    expect(commit).toHaveBeenCalledWith(types.default.ADD_MANY_CATEGORIES, [category]);
  });

  it('does not create a local category when the API fails', async () => {
    const error = new Error('Falha ao criar categoria');
    axios.post.mockRejectedValue(error);

    await expect(
      actions.create({ commit }, { categoryObj: { name: category.name } })
    ).rejects.toThrow('Falha ao criar categoria');

    expect(commit).not.toHaveBeenCalledWith(types.default.ADD_CATEGORY, expect.anything());
  });

  it('stores a category returned by a successful create', async () => {
    axios.post.mockResolvedValue({ data: { category } });

    await expect(
      actions.create({ commit }, { categoryObj: { name: category.name } })
    ).resolves.toBe(category.id);

    expect(axios.post).toHaveBeenCalledWith('/api/v1/help/categories', {
      name: category.name,
    });
    expect(commit).toHaveBeenCalledWith(types.default.ADD_CATEGORY, category);
  });

  it('removes a category only when the server confirms deletion', async () => {
    axios.delete.mockResolvedValue({ status: 204 });

    await expect(actions.delete({ commit }, { categoryId: category.id })).resolves.toBe(
      category.id
    );

    expect(axios.delete).toHaveBeenCalledWith('/api/v1/help/categories/category-1');
    expect(commit).toHaveBeenCalledWith(types.default.REMOVE_CATEGORY, category.id);
  });
});
