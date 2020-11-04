import axios from 'axios';
import knex from '../helpers/knex';

const Service: IBaseService<IUserObject> = {
  scrape: async (): Promise<IUserObject[]> => {
    const firstResponse = await axios.get<IReqResResponse>('https://reqres.in/api/users?page=1');

    const users = firstResponse.data.data;

    if (firstResponse.data.total_pages > 1) {
      const proms = Array.from({ length: firstResponse.data.total_pages - 1 }).map(async (_, i) => {
        const page = await axios.get<IReqResResponse>(`https://reqres.in/api/users?page=${i + 2}`);

        return page.data.data;
      });

      const otherPages = await Promise.all(proms);

      const combined = users.concat(...otherPages);

      return combined;
    }

    return users;
  },
  reset: async (): Promise<void> => {
    const data = await Service.scrape();

    await knex('user').del();

    await knex('user').insert(data);
  },
  getAll: async (): Promise<IUserObject[]> => {
    const users = await knex<IUserObject>('user');

    return users;
  },
};

export default Service;
