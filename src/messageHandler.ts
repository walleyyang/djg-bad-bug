import axios from 'axios';
import 'dotenv/config';

import { Flow } from 'modifiers/messageModel';

const flowUrl = process.env.DATA_HANDLER_FLOW_URL || '';

const sendMessage = async (message: Flow) => {
  try {
    await axios.post(flowUrl, message);
  } catch (error) {
    console.log('DJG Bad Bug send message error: ');
    console.log(error);
  }
};

export { sendMessage };
