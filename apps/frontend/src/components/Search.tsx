import { useEffect, useState } from 'react';
import { Data } from '../types';
import { searchData } from '../services/search';
import { toast } from 'sonner';
import { useDebounce } from '@uidotdev/usehooks';

export const Search = ({ initialData }: { initialData: Data }) => {
  const [data, setData] = useState<Data>(initialData);
  const [search, setSearch] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('q') ?? '';
  });

  const debouncedSearch = useDebounce(search, 300);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    const newPathname =
      debouncedSearch === ''
        ? window.location.pathname
        : `?q=${debouncedSearch}`;

    window.history.pushState({}, '', newPathname);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!debouncedSearch) {
      setData(initialData);
      return;
    }
    const fetchData = async () => {
      try {
        const res = await searchData(debouncedSearch);
        const [error, newData] = res;
        if (error) {
          toast.error(error.message);
          return;
        }
        if (newData) setData(newData);
      } catch (error) {
        if (error instanceof Error) return toast.error(error.message);
      }
    };
    fetchData();
  }, [debouncedSearch, initialData]);

  return (
    <section>
      <h1>Buscar</h1>
      <form>
        <input
          onChange={handleSearch}
          type='search'
          placeholder='Buscar información...'
          defaultValue={search}
        />
      </form>
      <ul>
        {data.map((row) => (
          <li key={row.id}>
            <article className='searchArticle'>
              {Object.entries(row).map(([key, value]) => (
                <p key={key}>
                  <strong>{key}: </strong>
                  {value}
                </p>
              ))}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
};
