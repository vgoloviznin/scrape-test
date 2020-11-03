import puppeteer from 'puppeteer';
import knex from '../helpers/knex';

async function clickWithWait(page: puppeteer.Page, selector: string) {
  await page.waitForSelector(selector);

  await page.click(selector);
}

async function setInputText(page: puppeteer.Page, selector: string, value: string) {
  await page.waitForSelector(selector);
  await page.focus(selector);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await page.$eval(selector, (el) => el.setSelectionRange(0, el.value.length));
  await page.type(selector, value);
}

const Service: IBaseService<IAffluentData> = {
  scrape: async (): Promise<IAffluentData[]> => {
    if (!process.env.AFFLUENT_USERNAME || !process.env.AFFLUENT_PASSWORD) {
      throw new Error('Affluent creds not present');
    }

    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
    ];

    const browser = await puppeteer.launch({
      args,
    });
    const page = await browser.newPage();

    await page.goto('https://develop.pub.afflu.net/login', { waitUntil: 'networkidle2' });

    await page.type('input[name="username"]', process.env.AFFLUENT_USERNAME);
    await page.type('input[name="password"]', process.env.AFFLUENT_PASSWORD);

    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    await page.goto('https://develop.pub.afflu.net/list?type=dates', { waitUntil: 'networkidle2' });

    await page.waitForSelector('#dashboard-report-range');

    await page.click('#dashboard-report-range');

    await setInputText(page, 'input[name="daterangepicker_start"]', '04/01/2020');
    await setInputText(page, 'input[name="daterangepicker_end"]', '04/30/2020');

    await page.click('.range_inputs .applyBtn');

    await page.waitForResponse('https://develop.pub.afflu.net/api/query/dates');

    await page.waitForTimeout(2000);

    await clickWithWait(page, '#DataTables_Table_0_length .dropdown-toggle');

    await clickWithWait(page, '#DataTables_Table_0_length ul.dropdown-menu li:last-child');

    await page.waitForResponse('https://develop.pub.afflu.net/api/query/dates');

    await page.waitForSelector('#DataTables_Table_0_length');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const data = await page.$$eval('#DataTables_Table_0 tbody tr', (rows) => rows.map((td) => td.innerText.split('\t'))) as unknown as string[][];

    await browser.close();

    const result: IAffluentData[] = data.map((dataRow) => ({
      date: dataRow[0],
      total_commission: dataRow[1],
      net_sales: parseInt(dataRow[2], 10),
      net_leads: parseInt(dataRow[3], 10),
      clicks: parseInt(dataRow[4].replace(',', ''), 10),
      epc: dataRow[5],
      impressions: parseInt(dataRow[6], 10),
      cr: dataRow[7],
    }));

    return result;
  },
  reset: async (): Promise<void> => {
    const data = await Service.scrape();

    await knex('affluent').del();

    await knex('affluent').insert(data);
  },
  getAll: async (): Promise<IAffluentData[]> => {
    const affluent = await knex<IAffluentData>('affluent');

    return affluent;
  },
};

export default Service;
