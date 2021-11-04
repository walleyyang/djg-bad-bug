import axios from 'axios';
import 'dotenv/config';

import { MessageType } from 'modifiers/enums';
import { Flow, Alert } from 'modifiers/messageModel';

const flowUrl = process.env.DATA_HANDLER_FLOW_URL || '';
const alertUrl = process.env.DATA_HANDLER_ALERT_URL || '';

const sendMessage = async (message: Flow | Alert) => {
  const url = message.messageType === MessageType.FLOW ? flowUrl : alertUrl;
  try {
    await axios.post(url, message);
  } catch (error) {
    console.log('DJG Bad Bug send message error: ');
    console.log(error);
  }
};

export { sendMessage };
