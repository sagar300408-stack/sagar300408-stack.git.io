import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import handler from './api/v1/content.js';

const req = {
  method: 'GET',
  query: {}
};

const res = {
  setHeader: (name, value) => {},
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    this.data = data;
    console.log('Response:', this.statusCode, this.data);
    return this;
  },
  end: function() {
    console.log('Response Ended');
  }
};

async function test() {
  try {
    await handler(req, res);
  } catch (err) {
    console.error('Uncaught Exception:', err);
  }
}

test();
