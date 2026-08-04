import axios from 'axios';
import * as types from '../../../mutation-types';
import { actions } from '../actions';

global.axios = axios;
vi.mock('axios');

const article = {
  id: 'article-1',
  title: 'Como configurar o WhatsApp',
  content: '<p>Conteúdo</p>',
  status: 'published',
};

describe('helpCenterArticles actions', () => {
  const commit = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  it('loads only articles returned by the Abravely API', async () => {
    axios.get.mockResolvedValue({
      data: { articles: [article], meta: { allArticlesCount: 1 } },
    });

    await expect(actions.index({ commit }, { query: 'WhatsApp' })).resolves.toEqual([
      article.id,
    ]);

    expect(axios.get).toHaveBeenCalledWith('/api/v1/help/articles', {
      params: { search: 'WhatsApp' },
    });
    expect(commit).toHaveBeenCalledWith(types.default.ADD_MANY_ARTICLES, [article]);
    expect(commit).toHaveBeenCalledWith(types.default.ADD_MANY_ARTICLES_ID, [article.id]);
  });

  it('propagates an API failure instead of inventing local articles', async () => {
    const error = new Error('API indisponível');
    axios.get.mockRejectedValue(error);

    await expect(actions.index({ commit })).rejects.toThrow('API indisponível');
    expect(commit).not.toHaveBeenCalledWith(types.default.ADD_ARTICLE, expect.anything());
    expect(commit).toHaveBeenLastCalledWith(types.default.SET_UI_FLAG, {
      isFetching: false,
    });
  });

  it('creates an article only after the API confirms it', async () => {
    axios.post.mockResolvedValue({ data: { article } });

    await expect(actions.create({ commit }, article)).resolves.toBe(article.id);

    expect(axios.post).toHaveBeenCalledWith('/api/v1/help/articles', article);
    expect(commit).toHaveBeenCalledWith(types.default.ADD_ARTICLE, article);
    expect(commit).toHaveBeenCalledWith(types.default.ADD_ARTICLE_ID, article.id);
  });

  it('keeps the current record when an update request fails', async () => {
    const error = new Error('Falha ao salvar');
    axios.patch.mockRejectedValue(error);

    await expect(
      actions.update({ commit }, { articleId: article.id, title: 'Novo título' })
    ).rejects.toThrow('Falha ao salvar');

    expect(commit).not.toHaveBeenCalledWith(types.default.UPDATE_ARTICLE, expect.anything());
    expect(commit).toHaveBeenLastCalledWith(types.default.UPDATE_ARTICLE_FLAG, {
      articleId: article.id,
      uiFlags: { isUpdating: false },
    });
  });

  it('removes an article from the store only after a successful delete', async () => {
    axios.delete.mockResolvedValue({ status: 204 });

    await expect(actions.delete({ commit }, { articleId: article.id })).resolves.toBe(
      article.id
    );

    expect(axios.delete).toHaveBeenCalledWith('/api/v1/help/articles/article-1');
    expect(commit).toHaveBeenCalledWith(types.default.REMOVE_ARTICLE, article.id);
  });
});
