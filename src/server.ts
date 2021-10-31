import express from 'express';
import 'dotenv/config';

import { watcher } from 'watcher';
// import { Flow, Alert } from 'validators/validator';
// import { validFlow } from 'validators/flowValidator';
// import { validAlert } from 'validators/alertValidator';

const createServer = () => {
  const port = process.env.BAD_BUG_PORT;

  const app = express();

  return app.listen(port, () => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`DJG Bad Bug listening on port: ${port}`);
    watcher();
  });
};

// const handleFlow = (flow: Flow) => {
//   console.log('handling flow....');
//   console.log(flow);
// };

// const handleAlert = (alert: Alert) => {
//   console.log('handling alert....');
//   console.log(alert);
// };

export { createServer };
