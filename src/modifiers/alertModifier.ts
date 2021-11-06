import { MessageType } from 'modifiers/enums';
import { Alert } from 'modifiers/messageModel';

const modifyAlert = (data: string[]) => {
  return JSON.parse(
    JSON.stringify({
      messageType: MessageType.ALERT,
      symbol: data[0],
      time: data[1],
      expiration: data[2],
      strike: parseFloat(data[3]),
      position: data[4],
      sentiment: data[5].split('_')[1],
      alertPrice: parseFloat(data[6]),
    }),
  ) as Alert;
};

export { modifyAlert };
