import axios from 'axios';
import {serverUrl} from './constants';

export const getHeartRate = async videoUri => {
  try {
    let fd = new FormData();
    fd.append('video', {
      name: 'video.mp4',
      uri: videoUri,
      type: 'video/mp4',
    });
    const endPoint = '/get-heart-rate';
    return axios({
      method: 'post',
      url: serverUrl + endPoint,
      data: fd,
      headers: {'Content-Type': 'multipart/form-data'},
    });
  } catch (err) {
    console.log(err);
  }
};
