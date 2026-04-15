import useSWR from 'swr';
import axios from 'axios';
import { Builder } from '@/app/services/builders.swr';

// Tipos auxiliares
export type StatusType = "Online" | "Offline";

// Interface de cada atendente
export interface Attendence {
  identity: string;
  fullName: string;
  email: string;
  teams: string[];
  status: StatusType;
  isEnabled: boolean;
}

// Interface da resposta da API
export interface AttendencesResponse {
  sucess: number;
  total: number;
  attendences: Attendence[];
  message: string;
}

interface BodyToRequest {
  url: string,
  body: Builder
}

const fetcher = async (
  body: BodyToRequest
): Promise<AttendencesResponse> => {

  const { data } = await axios.post(
    body.url,
    {
      "url": body.body.url,
      "tokenRouter": body.body.tokenRooter,
      "tokenBuilder": body.body.tokenBuilder,
    }
  );

  return data;
};

export function swrAttendence(builder: Builder | null) {
  const url = process.env.API_URL_BACKEND ?? "https://thato-thato-be.nijpgo.easypanel.host"
  const { data, error, isLoading, mutate } = useSWR(
    { url: `${url}/api/get/attendences`, body: builder },
    fetcher
  );

  return {
    attendences: data?.attendences || [],
    isLoading,
    isError: error,
    message: data?.message || '',
    refresh: mutate
  };
}