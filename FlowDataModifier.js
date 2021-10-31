// const Config = require('./config.json');

// class FlowDataModifier {
//   largeValueFlowStocks = Config.largeValueFlowStocks;
//   validStocks = Config.validStocks;
//   call = Config.position.call;

//   minValue = Config.minValue;
//   minLargeValueFlowStockValue = Config.minLargeValueFlowStockValue;
//   minGoldenSweepValue = Config.minGoldenSweepValue;

//   maxDays = Config.maxDays;
//   maxGoldenSweepDays = Config.maxGoldenSweepDays;
//   secondsInDay = Config.secondsInDay;
//   millisecondsInSecond = Config.millisecondsInSecond;
//   maxDayAsMilliseconds =
//     this.secondsInDay * this.millisecondsInSecond * this.maxDays;
//   maxDayMilliseconds = Date.now() + this.maxDayAsMilliseconds;
//   maxGoldenSweepDayAsMilliseconds =
//     this.secondsInDay * this.millisecondsInSecond * this.maxGoldenSweepDays;
//   maxGoldenSweepDayMilliseconds =
//     Date.now() + this.maxGoldenSweepDayAsMilliseconds;

//   getJsonString = (initialFilteredData) => {
//     const initialFilteredDataSymbol = initialFilteredData[1];
//     const initialFilteredDataExpiration = initialFilteredData[2];
//     const initialFilteredDataPosition = initialFilteredData[4];
//     const initialFilteredDataDetails = initialFilteredData[6].replace('_', ' ');
//     const initialFilteredDataType = initialFilteredData[7];
//     const initialFilteredDataValue = initialFilteredData[8];
//     const initialFilteredDataEstimatedValue = this.getEstimatedValue(
//       initialFilteredDataValue
//     );
//     const goldenSweepCheck = this.isGoldenSweep(
//       initialFilteredDataEstimatedValue,
//       initialFilteredDataType,
//       initialFilteredDataExpiration
//     );
//     const flowSentiment = this.getSentiment(
//       initialFilteredDataPosition,
//       initialFilteredDataDetails
//     );
//     const validFilterCheck = this.isValidFilter(
//       initialFilteredDataExpiration,
//       initialFilteredDataEstimatedValue,
//       goldenSweepCheck,
//       initialFilteredDataSymbol,
//       initialFilteredDataType
//     );

//     return JSON.stringify({
//       messageType: Config.messageTypes['flow'],
//       time: initialFilteredData[0],
//       symbol: initialFilteredDataSymbol,
//       expiration: initialFilteredDataExpiration,
//       strike: initialFilteredData[3],
//       position: initialFilteredDataPosition,
//       stockPrice: initialFilteredData[5],
//       details: initialFilteredDataDetails,
//       type: initialFilteredDataType,
//       value: initialFilteredDataValue,
//       estimatedValue: initialFilteredDataEstimatedValue,
//       goldenSweep: goldenSweepCheck,
//       sentiment: flowSentiment,
//       validFilter: validFilterCheck,
//     });
//   };

//   getSentiment = (position, details) => {
//     const letters = details.split(' ')[1];
//     const verifyLetter = 'A';
//     const bullish = Config.sentiment.bullish;
//     const bearish = Config.sentiment.bearish;
//     let sentiment = '';

//     if (position === this.call) {
//       sentiment =
//         letters === undefined || letters.includes(verifyLetter)
//           ? bullish
//           : bearish;
//     } else {
//       sentiment =
//         letters === undefined || letters.includes(verifyLetter)
//           ? bearish
//           : bullish;
//     }

//     return sentiment;
//   };

//   // Rough estimate... pretty much adding zeros
//   getEstimatedValue = (value) => {
//     const letter = value.slice(-1) === 'K' ? 'K' : 'M';
//     const numericBeforeDecimal = value
//       .substring(0, value.indexOf('.'))
//       .replace('$', '');
//     const numeric =
//       letter === 'K'
//         ? `${numericBeforeDecimal}000`
//         : `${numericBeforeDecimal}000000`;

//     return numeric;
//   };

//   isGoldenSweep = (estimatedValue, type, expiration) => {
//     const validValueType =
//       estimatedValue >= this.minGoldenSweepValue && type === 'SWEEP';
//     const validExpiration =
//       this.maxGoldenSweepDayMilliseconds - Date.parse(expiration) >= 1;

//     return validValueType && validExpiration;
//   };

//   isValidData = (data) => {
//     const dataKeys = Config.validDataKeys;

//     const minDataLength = dataKeys.length;
//     let validData = true;
//     let validFilter = false;

//     if (
//       Object.keys(data).length === 0 ||
//       Object.keys(data).length < minDataLength
//     ) {
//       validData = false;
//     } else {
//       for (let key of dataKeys) {
//         validData = !(
//           data[key] === 'undefined' ||
//           data[key] === null ||
//           data[key] === ''
//         );

//         if (key === 'validFilter') {
//           validFilter = data[key];
//         }

//         if (!validData) break;
//       }
//     }

//     return validData && validFilter;
//   };

//   isExpirationWithinFilteredDay = (expiration) => {
//     return this.maxDayMilliseconds - Date.parse(expiration) >= 1;
//   };

//   /*
//     Expiration needs to be within max day or max golden sweep day.
//     Requires stock to be within valid stock group.
//     Requires value to meet minimum value or larger minimum value for large value stocks.
//     Requires flow to be a sweep.
//   */
//   isValidFilter = (expiration, estimatedValue, isGoldenSweep, symbol, type) => {
//     const validExpiration = this.isExpirationWithinFilteredDay(expiration);
//     const validStock = this.validStocks.includes(symbol);
//     const validValue = this.largeValueFlowStocks.includes(symbol)
//       ? estimatedValue >= this.minLargeValueFlowStockValue
//       : estimatedValue >= this.minValue;
//     const validType = type === 'SWEEP' ? true : false;

//     const validFilter = isGoldenSweep
//       ? true
//       : validExpiration && validStock && validValue && validType;

//     return validFilter;
//   };
// }

// module.exports = FlowDataModifier;
