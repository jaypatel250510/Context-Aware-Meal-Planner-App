import axios from 'axios';
import {serverUrl} from './constants';

export const getDietPlan = async data => {
  try {
    const endPoint = '/get-diet-plan';
    let res = await axios.post(serverUrl + endPoint, data);
    return res;
  } catch (err) {
    console.log(err);
  }
};
