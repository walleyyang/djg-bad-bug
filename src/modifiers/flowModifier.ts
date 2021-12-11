import { MessageType } from 'modifiers/enums';
import { Flow } from 'modifiers/messageModel';

const modifyFlow = (data: string[]) => {
  const time = data[0];
  const dataSymbol = data[1];
  const dataExpiration = data[2];
  const strike = parseFloat(data[3]);
  const dataPosition = data[4];
  const stockPrice = parseFloat(data[5]);
  const dataDetails = data[6].replace('_', ' ');
  const dataType = data[7];
  const dataValue = data[8];

  return JSON.parse(
    JSON.stringify({
      messageType: MessageType.FLOW,
      time: time,
      symbol: dataSymbol,
      expiration: dataExpiration,
      strike: strike,
      position: dataPosition,
      stockPrice: stockPrice,
      details: dataDetails,
      type: dataType,
      value: dataValue,
    }),
  ) as Flow;
};

export { modifyFlow };
