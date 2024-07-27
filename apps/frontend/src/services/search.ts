import { type ApiSearchResponse, type Data } from '../types';

export const searchData = async (search: string): Promise<[Error?, Data?]> => {
  try {
    const res = await fetch(`/api/users?q=${search}`);

    if (!res.ok)
      return [new Error(`Error al buscar los datos: ${res.statusText}`)];
    const json = (await res.json()) as ApiSearchResponse;
    return [undefined, json.data];
  } catch (error) {
    if (error instanceof Error) return [error];
  }

  return [new Error('Error desconocido')];
};
