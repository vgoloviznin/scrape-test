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

interface IAffluentData {
  date: string;
  total_commission: string;
  net_sales: number;
  net_leads: number;
  clicks: number;
  epc: string;
  impressions: number;
  cr: string;
}
