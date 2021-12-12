import express from 'express';

import { flowWatcher } from 'flowWatcher';
import { alertWatcher } from 'alertWatcher';
import { port } from 'watcherConstants';

const createServer = () => {
  const app = express();

  return app.listen(port, () => {
    console.log(`DJG Bad Bug server listening on port: ${port}`);

    flowWatcher();
    alertWatcher();
  });
};

export { createServer };
