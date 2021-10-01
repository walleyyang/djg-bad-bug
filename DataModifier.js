const Config = require('./config.json');
class DataModifier {
  largeValueFlowStocks = Config.largeValueFlowStocks;
  validStocks = Config.validStocks;

  minValue = Config.minValue;
  minLargeValueFlowStockValue = Config.minLargeValueFlowStockValue;
  minGoldenSweepValue = Config.minGoldenSweepValue;

  maxDays = Config.maxDays;
  maxGoldenSweepDays = Config.maxGoldenSweepDays;
  secondsInDay = Config.secondsInDay;
  millisecondsInSecond = Config.millisecondsInSecond;
  maxDayAsMilliseconds =
    this.secondsInDay * this.millisecondsInSecond * this.maxDays;
  maxDayMilliseconds = Date.now() + this.maxDayAsMilliseconds;
  maxGoldenSweepDayAsMilliseconds =
    this.secondsInDay * this.millisecondsInSecond * this.maxGoldenSweepDays;
  maxGoldenSweepDayMilliseconds =
    Date.now() + this.maxGoldenSweepDayAsMilliseconds;

  getJsonString = (filteredData) => {
    const filteredDataSymbol = filteredData[1];
    const filteredDataExpiration = filteredData[2];
    const filteredDataPosition = filteredData[4];
    const filteredDataDetails = filteredData[6].replace('_', ' ');
    const filteredDataType = filteredData[7];
    const filteredDataValue = filteredData[8];
    const filteredDataEstimatedValue =
      this.getEstimatedValue(filteredDataValue);
    const goldenSweepCheck = this.isGoldenSweep(
      filteredDataEstimatedValue,
      filteredDataType,
      filteredDataExpiration
    );
    const flowSentiment = this.getSentiment(
      filteredDataPosition,
      filteredDataDetails
    );
    const validFilterCheck = this.isValidFilter(
      filteredDataExpiration,
      filteredDataEstimatedValue,
      goldenSweepCheck,
      filteredDataSymbol,
      filteredDataType
    );

    return JSON.stringify({
      time: filteredData[0],
      symbol: filteredDataSymbol,
      expiration: filteredDataExpiration,
      strike: filteredData[3],
      position: filteredDataPosition,
      stockPrice: filteredData[5],
      details: filteredDataDetails,
      type: filteredDataType,
      value: filteredDataValue,
      estimatedValue: filteredDataEstimatedValue,
      goldenSweep: goldenSweepCheck,
      sentiment: flowSentiment,
      validFilter: validFilterCheck,
    });
  };

  getSentiment = (position, details) => {
    const letters = details.split(' ')[1];
    const verifyLetter = 'A';
    const bullish = 'BULLISH';
    const bearish = 'BEARISH';
    let sentiment = '';

    if (position === 'CALL') {
      sentiment = letters.includes(verifyLetter) ? bullish : bearish;
    } else {
      sentiment = letters.includes(verifyLetter) ? bearish : bullish;
    }

    return sentiment;
  };

  // Rough estimate... pretty much adding zeros
  getEstimatedValue = (value) => {
    const letter = value.slice(-1) === 'K' ? 'K' : 'M';
    const numericBeforeDecimal = value
      .substring(0, value.indexOf('.'))
      .replace('$', '');
    const numeric =
      letter === 'K'
        ? `${numericBeforeDecimal}000`
        : `${numericBeforeDecimal}000000`;

    return numeric;
  };

  isGoldenSweep = (estimatedValue, type, expiration) => {
    const validValueType =
      estimatedValue >= this.minGoldenSweepValue && type === 'SWEEP';
    const validExpiration =
      this.maxGoldenSweepDayMilliseconds - Date.parse(expiration) >= 1;

    return validValueType && validExpiration;
  };

  isValidData = (data) => {
    const dataKeys = Config.validDataKeys;

    const minDataLength = dataKeys.length;
    let validData = true;
    let validFilter = false;

    if (
      Object.keys(data).length === 0 ||
      Object.keys(data).length < minDataLength
    ) {
      validData = false;
    } else {
      for (let key of dataKeys) {
        validData = !(
          data[key] === 'undefined' ||
          data[key] === null ||
          data[key] === ''
        );

        if (key === 'validFilter') {
          validFilter = data[key];
        }

        if (!validData) break;
      }
    }

    return validData && validFilter;
  };

  isExpirationWithinFilteredDay = (expiration) => {
    return this.maxDayMilliseconds - Date.parse(expiration) >= 1;
  };

  /*
    Expiration needs to be within max day or max golden sweep day.
    Requires stock to be within valid stock group.
    Requires value to meet minimum value or larger minimum value for large value stocks.
    Requires flow to be a sweep.
  */
  isValidFilter = (expiration, estimatedValue, isGoldenSweep, symbol, type) => {
    const validExpiration = this.isExpirationWithinFilteredDay(expiration);
    const validStock = this.validStocks.includes(symbol);
    const validValue = this.largeValueFlowStocks.includes(symbol)
      ? estimatedValue >= this.minLargeValueFlowStockValue
      : estimatedValue >= this.minValue;
    const validType = type === 'SWEEP' ? true : false;

    const validFilter = isGoldenSweep
      ? true
      : validExpiration && validStock && validValue && validType;

    return validFilter;
  };
}

module.exports = DataModifier;
