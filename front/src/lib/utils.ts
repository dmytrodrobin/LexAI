import axios from "axios"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function postRequest(path: string, requestData: any) {
  const { data } = await axios.post(`${API_BASE_URL}${path}`, requestData, {
    withCredentials: true,
  })
  return data
}

export async function getRequest(requestData: any) {
  const { data } = await axios.get(`${API_BASE_URL}${requestData}`, {
    withCredentials: true,
  })
  return data
}
