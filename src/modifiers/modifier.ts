import { modifyFlow } from 'modifiers/flowModifier';

const production = 'PROD';
const mode = process.env.MODE || '';

const modifier = (rawData: string) => {
  return getData(splitData(rawData));
};

// Split the initial raw data
const splitData = (rawData: string) => {
  const rawDataUpper = rawData.toUpperCase();
  let splitData = [];

  if (mode === production) {
    splitData = rawDataUpper.split('\n');
  } else {
    splitData = rawDataUpper.replace(/\t/g, '\n').split('\n');
  }

  return splitData;
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

export { modifier };
