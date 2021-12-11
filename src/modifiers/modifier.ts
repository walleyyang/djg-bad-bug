import { Environment, MessageType } from 'modifiers/enums';
import { modifyFlow } from 'modifiers/flowModifier';
import { modifyAlert } from 'modifiers/alertModifier';

const mode = process.env.MODE || '';

const modifier = (messageType: string, data: string[]) => {
  return messageType === MessageType.FLOW ? modifyFlow(data) : modifyAlert(data);
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

  return splittedData.map((data) => data.trim());
};

export { modifier, splitData };
