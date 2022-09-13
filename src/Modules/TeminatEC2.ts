import fetch from 'cross-fetch';

const CALLBACK_GATEWAY = process.env.CALLBACK_GATEWAY;

export const fetchDelete = (instanceId: string) =>
  fetch(`${CALLBACK_GATEWAY}?id=${instanceId}`, {
    method: 'DELETE',
  });
