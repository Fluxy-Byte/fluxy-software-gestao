import useSWR from 'swr';
import axios from 'axios';
import { UserWithRelations } from "@/app/api/interfaces/user.interface";

export interface ResultGetUsers {
  status: boolean
  users: UserWithRelations[]
  message: string
}

const fetcher = async (url: string): Promise<ResultGetUsers> => {
  const { data } = await axios.get(url, {
    withCredentials: true
  })
  return data
}

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR('/api/users', fetcher);

  return {
    users: data?.users || [],
    isLoading,
    isError: error,
    message: data?.message,
    refresh: mutate
  }
}