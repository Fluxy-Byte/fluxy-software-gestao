import useSWR from 'swr';
import axios from 'axios';

export interface ResultGetBuilders {
  status: boolean;
  builders: Builder[];
  message: string;
}

export interface Builder {
  id: string;
  name: string;
  tokenBuilder: string;
  tokenRooter: string;
  lastUpdate: string | null;
  createDate: string;
  idUserCreate: string;
  url: string;
  builderMemberships: BuilderMembership[];
}

export interface BuilderMembership {
  user: User;
}

export interface User {
  id: string;
  name: string;
}

const fetcher = async (url: string): Promise<ResultGetBuilders> => {
  const { data } = await axios.get(url, {
    withCredentials: true
  })
  return data
}

export function useBuilders() {
  const { data, error, isLoading, mutate } = useSWR('/api/builders', fetcher)

  return {
    builders: data?.builders || [],
    isLoading,
    isError: error,
    message: data?.message,
    refresh: mutate
  }
}