import useSWR from 'swr';
import axios from 'axios';

export interface History {
  id: number;
  createdAt: string;
  nameUser: string;
  idUser: string;
  nameAction: string;
  typeAction?: string;
  tickets: HistoryTickets[];
  historyId: string;
}

export interface HistoryTickets {
  id: number,
  ticketId: string,
  sequentialId: number,
  queueStart: string,
  queueEnd: string,
  attendenceStart: string,
  attendenceEnd: string,
  result: string,
  motive: string,
  historyId: number
}

export interface ResultGetTickets {
  status: boolean;
  history: History[];
  message: string;
}

const fetcher = async (
  url: string
): Promise<ResultGetTickets> => {

  const { data } = await axios.get(
    url
  );

  return data;
};

export function useHistory() {
  const url = process.env.API_URL_BACKEND ?? "https://thato-thato-be.nijpgo.easypanel.host"
  const { data, error, isLoading, mutate } = useSWR(
    `${url}/api/get/history/trasnfer`,
    fetcher
  );

  return {
    history: data?.history || [],
    isLoading,
    isError: error,
    message: data?.message || '',
    refresh: mutate
  };
}