import axios from 'axios';

import { MessageType } from 'modifiers/enums';
import { Flow, Alert } from 'modifiers/messageModel';
import { flowUrl, alertUrl, sendMessageError } from 'watcherConstants';

const sendMessage = async (message: Flow | Alert) => {
  const url = message.messageType === MessageType.FLOW ? flowUrl : alertUrl;
  try {
    await axios.post(url, message);
  } catch (error) {
    console.log(sendMessageError);
    console.log(error);
  }
};

export { sendMessage };
