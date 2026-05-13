import { app } from './app';
import { env } from './config/env';

const HOST = '0.0.0.0';

app.listen(env.port, HOST, () => {
  console.log(`TalentBridge API listening on http://${HOST}:${env.port}`);
});
