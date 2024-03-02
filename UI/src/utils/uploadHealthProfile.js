import axios from 'axios';
import {serverUrl} from './constants';

export const uploadHealthProfile = data => {
  try {
    const endPoint = '/store-health-profile';
    return axios.post(serverUrl + endPoint, data);
  } catch (err) {
    console.log(err);
  }
};
