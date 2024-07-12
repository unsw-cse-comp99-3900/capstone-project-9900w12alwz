import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const get = (url, config = {}) => {
  return api.get(url, config);
};

export const post = (url, data, config = {}) => {
  return api.post(url, data, config);
};

export const put = (url, data, config = {}) => {
  return api.put(url, data, config);
};

export const del = (url, config = {}) => {
  return api.delete(url, config);
};
