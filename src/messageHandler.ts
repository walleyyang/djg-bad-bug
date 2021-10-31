import axios from 'axios';
import 'dotenv/config';

import { Flow } from 'modifiers/messageModel';

const flowUrl = process.env.DATA_HANDLER_FLOW_URL || '';

const sendMessage = async (message: Flow) => {
  try {
    const options = {
      url: flowUrl,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
      },
      data: message,
    };

    await axios(JSON.stringify(options));
  } catch (error) {
    console.log('DJG Bad Bug send message error: ');
    console.log(error);
  }
};

export { sendMessage };
