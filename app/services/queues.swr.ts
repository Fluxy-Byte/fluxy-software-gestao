import useSWR from 'swr';
import axios from 'axios';
import { Builder } from '@/app/services/builders.swr';

// Interface de cada fila (queue)
export interface Queue {
  id: string;
  ownerIdentity: string;
  name: string;
  isActive: boolean;
  storageDate: string; // pode virar Date depois se quiser tratar
  Priority: number;
  uniqueId: string;
}

// Interface da resposta da API
export interface QueuesResponse {
  sucess: number;
  total: number;
  queues: Queue[];
  message: string;
}

interface BodyToRequest {
  url: string,
  body: Builder
}

const fetcher = async (
  body: BodyToRequest
): Promise<QueuesResponse> => {

  const { data } = await axios.post(
    body.url,
    {
      "url": body.body.url,
      "tokenRouter": body.body.tokenRooter,
      "tokenBuilder": body.body.tokenBuilder
    }
  );

  return data;
};

export function swrQueues(builder: Builder | null) {
  const url = process.env.API_URL_BACKEND ?? "https://thato-thato-be.nijpgo.easypanel.host"
  const { data, error, isLoading, mutate } = useSWR(
    { url: `${url}/api/get/queues`, body: builder },
    fetcher
  );

  return {
    queues: data?.queues || [],
    isLoading,
    isError: error,
    message: data?.message || '',
    refresh: mutate
  };
}