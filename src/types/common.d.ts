interface IBaseService<T> {
  scrape(): Promise<T[]>,
  reset(): Promise<void>,
  getAll(): Promise<T[]>
}
