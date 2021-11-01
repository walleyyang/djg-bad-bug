import { Environment } from 'modifiers/enums';
import { modifyFlow } from 'modifiers/flowModifier';

const mode = process.env.MODE || '';

const modifier = (data: string[]) => {
  return getData(data);
};

// Split the initial raw data
const splitData = (rawData: string) => {
  const rawDataUpper = rawData.toUpperCase();
  let splittedData = [];

  if (mode === Environment.PROD) {
    splittedData = rawDataUpper.split('\n');
  } else {
    splittedData = rawDataUpper.replace(/\t/g, '\n').split('\n');
  }

  return splittedData;
};

const getData = (splittedData: string[]) => {
  return modifyFlow(splittedData);
  // const alertSentimentIndex = 5;
  // if (splitData.length > 1) {
  //   const data =
  //     splitData[alertSentimentIndex].includes('BULLISH') || splitData[alertSentimentIndex].includes('BEARISH')
  //       ? getAlertData(alertDataModifier, splitData)
  //       : getFlowData(flowDataModifier, splitData);
  //   if (data !== null) {
  //     // console.log(data);
  //     // websocketClient.send(data);
  //   }
  // }
};

export { modifier, splitData };
