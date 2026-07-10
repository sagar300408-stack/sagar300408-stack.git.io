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
    console.log('Response:', this.statusCode, JSON.stringify(this.data));
    process.exit(0);
  },
  end: function() {
    console.log('Response Ended');
    process.exit(0);
  }
};

async function test() {
  try {
    await handler(req, res);
  } catch (err) {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  }
}

test();
