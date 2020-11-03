import axios from 'axios';
import knex from '../helpers/knex';

const Service: IBaseService<IUserObject> = {
  scrape: async (): Promise<IUserObject[]> => {
    const [firstPage, secondPage] = await Promise.all([
      axios.get<IReqResResponse>('https://reqres.in/api/users?page=1'),
      axios.get<IReqResResponse>('https://reqres.in/api/users?page=2'),
    ]);

    const users = firstPage.data.data.concat(secondPage.data.data);

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
