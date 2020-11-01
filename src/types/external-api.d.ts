interface IUserObject {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

interface IReqResResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: IUserObject[]
}
