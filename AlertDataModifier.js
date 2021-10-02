const Config = require('./config.json');

class AlertDataModifier {
  getJsonString = (initialFilteredData) => {
    return JSON.stringify({
      messageType: Config.messageTypes['alert'],
      symbol: initialFilteredData[0],
      time: initialFilteredData[1],
      expiration: initialFilteredData[2],
      strike: initialFilteredData[3],
      position: initialFilteredData[4],
      sentiment: initialFilteredData[5].split('_')[1],
      alertPrice: initialFilteredData[6],
    });
  };
}

module.exports = AlertDataModifier;
