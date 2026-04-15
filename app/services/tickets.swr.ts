import useSWR from 'swr';
import axios from 'axios';
import { Builder } from '@/app/services/builders.swr';

export interface Tickets {
  id: string;
  sequentialId: number;
  ownerIdentity: string;
  customerIdentity: string;
  customerDomain: string;
  agentIdentity?: string;
  provider: string;
  status: string;
  storageDate: string;
  externalId: string;
  rating: number;
  team: string;
  unreadMessages: number;
  closed: boolean;
  priority: number;
  contact: ContactResource;
}

export interface ContactResource {
  lastMessageDate: string;
  lastUpdateDate: string;
  identity: string;
  source: string;
  name?: string;
  gender?: string;
  extras?: {
    [key: string]: any;
  };
}

export interface ResultGetTickets {
  sucess: boolean;
  total: number;
  tickets: Tickets[];
  message: string;
}

interface BodyToRequest {
  url: string,
  body: Builder
}

const fetcher = async (
  body: BodyToRequest
): Promise<ResultGetTickets> => {

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

export function swrTickets(builder: Builder | null) {
  const url = process.env.API_URL_BACKEND ?? "https://thato-thato-be.nijpgo.easypanel.host"
  const { data, error, isLoading, mutate } = useSWR(
    { url: `${url}/api/get/tickets`, body: builder },
    fetcher
  );

  return {
    tickets: data?.tickets || [],
    isLoading,
    isError: error,
    message: data?.message || '',
    refresh: mutate
  };
}