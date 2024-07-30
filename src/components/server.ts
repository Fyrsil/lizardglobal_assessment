import { createServer } from 'miragejs';
import data from '../mock/data.json';

// Creating server
export function makeServer() {
  createServer({
    routes() {
      this.namespace = 'api';

      this.get('/data', () => {
        return data;
      });
    },
  });
  return null;
}
