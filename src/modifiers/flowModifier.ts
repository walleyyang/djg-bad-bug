import { MessageType, Sentiment, Position } from 'modifiers/enums';
import { Flow } from 'modifiers/messageModel';

const modifyFlow = (data: string[]) => {
  const dataSymbol = data[1];
  const dataExpiration = data[2];
  const dataPosition = data[4];
  const dataDetails = data[6].replace('_', ' ');
  const dataType = data[7];
  const dataValue = data[8];
  const dataEstimatedValue = getEstimatedValue(dataValue);
  const flowSentiment = getSentiment(dataPosition, dataDetails);

  return JSON.parse(
    JSON.stringify({
      messageType: MessageType.FLOW,
      time: data[0],
      symbol: dataSymbol,
      expiration: dataExpiration,
      strike: parseFloat(data[3]),
      position: dataPosition,
      stockPrice: parseFloat(data[5]),
      details: dataDetails,
      type: dataType,
      value: dataValue,
      estimatedValue: dataEstimatedValue,
      sentiment: flowSentiment,
    }),
  ) as Flow;
};

// Rough estimate... pretty much adding zeros
const getEstimatedValue = (value: string) => {
  const letter = value.slice(-1) === 'K' ? 'K' : 'M';
  const numericBeforeDecimal = value.substring(0, value.indexOf('.')).replace('$', '');
  const numeric = letter === 'K' ? `${numericBeforeDecimal}000` : `${numericBeforeDecimal}000000`;

  return parseInt(numeric);
};

// Assume ask or above ask puts are bearish and calls are bullish
// Assume bid or below bid puts are bullish and calls are bearish
const getSentiment = (position: string, details: string) => {
  const letters = details.split(' ')[1];
  const verifyLetter = 'A';
  const bullish = Sentiment.BULLISH;
  const bearish = Sentiment.BEARISH;
  let sentiment = '';

  if (position === Position.CALL) {
    sentiment = letters === undefined || letters.includes(verifyLetter) ? bullish : bearish;
  } else {
    sentiment = letters === undefined || letters.includes(verifyLetter) ? bearish : bullish;
  }

  return sentiment;
};

export { modifyFlow };
