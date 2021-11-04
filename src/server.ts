import express from 'express';
import 'dotenv/config';

import { flowWatcher } from 'flowWatcher';
import { alertWatcher } from 'alertWatcher';

const createServer = () => {
  const port = process.env.BAD_BUG_PORT;

  const app = express();

  return app.listen(port, () => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`DJG Bad Bug listening on port: ${port}`);

    flowWatcher();
    alertWatcher();
  });
};

export { createServer };
