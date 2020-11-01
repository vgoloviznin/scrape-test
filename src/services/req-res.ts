import axios from 'axios';

const Service = {
  scrape: async (): Promise<IUserObject[]> => {
    const [firstPage, secondPage] = await Promise.all([
      axios.get<IReqResResponse>('https://reqres.in/api/users?page=1'),
      axios.get<IReqResResponse>('https://reqres.in/api/users?page=2'),
    ]);

    const users = firstPage.data.data.concat(secondPage.data.data);

    return users;
  },
};

export default Service;
