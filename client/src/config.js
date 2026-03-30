import { API_BASE_URL } from "./axios";

const normalizedApiBase = API_BASE_URL.replace(/\/$/, "");

export const IMAGE_BASE_URL =
  process.env.REACT_APP_IMAGE_BASE_URL
  || `${normalizedApiBase.replace(/\/api$/, "")}/images`;
