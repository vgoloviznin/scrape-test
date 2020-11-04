import mockKnex from 'mock-knex';
import axios from 'axios';
import knex from '../../src/helpers/knex';
import ReqResService from '../../src/services/req-res';

const queryTracker = mockKnex.getTracker();
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeAll(() => {
  mockKnex.mock(knex);
});

beforeEach(() => {
  queryTracker.install();
});

afterEach(() => {
  queryTracker.uninstall();
});

afterAll(async () => {
  mockKnex.unmock(knex);

  await knex.destroy();
});

describe('test', () => {
  describe('-- getAll', () => {
    it('returns correct users', async () => {
      const users = [{ id: 1 }, { id: 2 }];

      queryTracker.on('query', (query) => {
        expect(query.sql).toEqual('select * from `user`');
        query.response(users);
      });

      const result = await ReqResService.getAll();

      expect(result).toStrictEqual(users);
    });
  });

  describe('-- reset', () => {
    it('-- clears and inserts data properly', async () => {
      const users = [{ id: 1 }, { id: 2 }] as IUserObject[];
      const scrapeMock = jest.spyOn(ReqResService, 'scrape').mockImplementation(() => Promise.resolve(users));

      queryTracker.on('query', (query, step) => {
        [
          function deleteQuery() {
            expect(query.sql).toEqual('delete from `user`');
            query.response([{ id: 1 }]);
          },
          function insertQuery() {
            expect(query.sql).toEqual('insert into `user` (`id`) values (?), (?)');
            const bindings = query.bindings as [number, number];

            expect(bindings[0]).toEqual(users[0].id);
            expect(bindings[1]).toEqual(users[1].id);

            query.response([]);
          },
        ][step - 1]();
      });

      await ReqResService.reset();

      expect(scrapeMock).toHaveBeenCalledWith();
      expect(scrapeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('-- scrape', () => {
    it('calls first page and returns results', async () => {
      const firstUserPage = [{ id: 1 }, { id: 2 }] as IUserObject[];
      const resp: IReqResResponse = {
        data: firstUserPage,
        total_pages: 1,
        page: 1,
        per_page: 2,
        total: 2,
      };
      mockedAxios.get.mockImplementationOnce(() => Promise.resolve({ data: resp }));

      const result = await ReqResService.scrape();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get).toHaveBeenCalledWith('https://reqres.in/api/users?page=1');
      expect(result).toStrictEqual(resp.data);
    });

    it('calls extra pages and returns combined results', async () => {
      const firstUserPage = [{ id: 1 }, { id: 2 }] as IUserObject[];
      const secondUserPage = [{ id: 3 }, { id: 4 }] as IUserObject[];
      const thirdUserPage = [{ id: 5 }, { id: 6 }] as IUserObject[];

      const firstResp: IReqResResponse = {
        data: firstUserPage, total_pages: 3, page: 1, per_page: 2, total: 6,
      };
      const secondResp: IReqResResponse = {
        data: secondUserPage, total_pages: 3, page: 2, per_page: 2, total: 6,
      };
      const thirdResp: IReqResResponse = {
        data: thirdUserPage, total_pages: 3, page: 3, per_page: 2, total: 6,
      };

      mockedAxios.get
        .mockImplementationOnce(() => Promise.resolve({ data: firstResp }))
        .mockImplementationOnce(() => Promise.resolve({ data: secondResp }))
        .mockImplementationOnce(() => Promise.resolve({ data: thirdResp }));

      const result = await ReqResService.scrape();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get).toHaveBeenNthCalledWith(1, 'https://reqres.in/api/users?page=1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get).toHaveBeenNthCalledWith(2, 'https://reqres.in/api/users?page=2');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get).toHaveBeenNthCalledWith(3, 'https://reqres.in/api/users?page=3');
      expect(result).toStrictEqual([...firstUserPage, ...secondUserPage, ...thirdUserPage]);
    });
  });
});
