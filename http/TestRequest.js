import { request } from './request';

const login = () => {
  return new Promise(function(resolve, reject) {
    request.post(
      'http://localhost:8010',
      { aaa: '123cc' },
      res => {
        resolve(res);
      },
      error => {
        reject(error);
      }
    );
  });
};

export { login };
