// const { MongoClient } = require('mongodb');

// const Config = require('./config.json');

// class Database {
//   client;
//   database = process.env.MONGO_INITDB_DATABASE;
//   collection = process.env.MONGO_COLLECTION;
//   call = Config.position.call;
//   put = Config.position.put;
//   bullish = Config.sentiment.bullish;
//   bearish = Config.sentiment.bearish;

//   connect = async () => {
//     const username = process.env.MONGO_INITDB_ROOT_USERNAME;
//     const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
//     const location = process.env.MONGO;
//     const port = process.env.MONGO_PORT;
//     const uri = `mongodb://${username}:${password}@${location}:${port}/${this.database}`;
//     this.client = new MongoClient(uri);

//     try {
//       console.log('Connecting to MongoDB...');
//       await this.client.connect();
//       console.log('Successfully connected to MongoDB');
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   insert = async (dataJsonString) => {
//     const data = JSON.parse(dataJsonString);
//     const collection = this.client
//       .db(this.database)
//       .collection(this.collection);

//     const result = await collection.find({ symbol: data.symbol });

//     if (await result.hasNext()) {
//       const doc = await result.toArray();
//       const updatedStrikes = this.getUpdatedStrikes(data, doc[0].strikes);
//       const updatedFlow = this.getUpdatedFlow(data, doc[0].flow);
//       const updatedDoc = await collection.updateOne(
//         { symbol: data.symbol },
//         { $set: { strikes: updatedStrikes, flow: updatedFlow } }
//       );
//     } else {
//       await collection.insertOne(this.getDocument(data));
//     }

//     this.updateChartsData(data);
//   };

//   // Create the data for charts here to improve a quicker display
//   updateChartsData = async (data) => {
//     const collection = this.client
//       .db(this.database)
//       .collection(this.collection);

//     const result = await collection.find({ symbol: data.symbol });

//     if (await result.hasNext()) {
//       const doc = await result.toArray();
//       const strikes = this.getStrikesData(doc[0].strikes);
//       const sentimentCount = this.getSentimentCount(doc[0].flow);
//       const flowSentimentOverTime = this.getFlowSentimentOverTime(doc[0].flow);
//       const updatedDoc = await collection.updateOne(
//         { symbol: data.symbol },
//         {
//           $set: {
//             chartData: {
//               strikes: strikes,
//               sentimentCount: sentimentCount,
//               flowSentimentOverTime: flowSentimentOverTime,
//             },
//           },
//         }
//       );
//     }
//   };

//   getDocument = (data) => {
//     return JSON.parse(
//       JSON.stringify({
//         symbol: data.symbol,
//         strikes: [this.getNewStrike(data)],
//         flow: [this.getNewFlow(data)],
//       })
//     );
//   };

//   getUpdatedStrikes = (data, strikes) => {
//     const position = data.position;
//     const sentiment = data.sentiment;
//     const estimatedValue = data.estimatedValue;
//     const strike = data.strike;

//     for (let s of strikes) {
//       if (s.strike === strike) {
//         // Assume calls at bid and below bid are bearish and add them to putsValue
//         if (position === this.call) {
//           sentiment === this.bullish
//             ? (s.callsValue += parseInt(estimatedValue))
//             : (s.putsValue += parseInt(estimatedValue));
//         }

//         // Assume puts at bid and below bid are bullish and add them to callsValue
//         if (position === this.put) {
//           sentiment === this.bearish
//             ? (s.putsValue += parseInt(estimatedValue))
//             : (s.callsValue += parseInt(estimatedValue));
//         }
//       }
//     }

//     const updatedStrikes = [...strikes];
//     let strikeExist = false;

//     for (let s of updatedStrikes) {
//       if (s.strike === strike) {
//         strikeExist = true;
//       }
//     }

//     if (!strikeExist) {
//       updatedStrikes.push(this.getNewStrike(data));
//     }

//     return updatedStrikes.sort((a, b) =>
//       parseInt(a.strike) < parseInt(b.strike) ? 1 : -1
//     );
//   };

//   getUpdatedFlow = (data, flow) => {
//     flow.unshift(this.getNewFlow(data));

//     return flow;
//   };

//   getNewStrike = (data) => {
//     let callsValue = 0;
//     let putsValue = 0;

//     // Assume calls at bid and below bid are bearish and add them to putsValue
//     if (data.position === this.call) {
//       data.sentiment === this.bullish
//         ? (callsValue = parseInt(data.estimatedValue))
//         : (putsValue = parseInt(data.estimatedValue));
//     }

//     // Assume puts at bid and below bid are bullish and add them to callsValue
//     if (data.position === this.put) {
//       data.sentiment === this.bearish
//         ? (putsValue = parseInt(data.estimatedValue))
//         : (callsValue = parseInt(data.estimatedValue));
//     }

//     return JSON.parse(
//       JSON.stringify({
//         strike: data.strike,
//         callsValue: callsValue,
//         putsValue: putsValue,
//       })
//     );
//   };

//   getNewFlow = (data) => {
//     return JSON.parse(
//       JSON.stringify({
//         sentiment: data.sentiment,
//         value: data.value,
//         position: data.position,
//         details: data.details,
//         type: data.type,
//         strike: data.strike,
//         expiration: data.expiration,
//         time: data.time,
//       })
//     );
//   };

//   getStrikesData = (strikes) => {
//     const labels = [];
//     const callsValue = [];
//     const putsValue = [];

//     for (let strike of strikes) {
//       labels.push(strike.strike);
//       callsValue.push(strike.callsValue);
//       putsValue.push(strike.putsValue);
//     }

//     const data = {
//       labels: labels,
//       datasets: [
//         {
//           label: 'Bullish Sentiment',
//           data: callsValue,
//           backgroundColor: ['Green'],
//         },
//         {
//           label: 'Bearish Sentiment',
//           data: putsValue,
//           backgroundColor: ['Red'],
//         },
//       ],
//     };

//     return data;
//   };

//   getSentimentCount(flow) {
//     let bullish = 0;
//     let bearish = 0;

//     for (let f of flow) {
//       f.sentiment === 'BULLISH' ? (bullish += 1) : (bearish += 1);
//     }

//     const data = {
//       labels: [`Bullish (${bullish})`, `Bearish (${bearish})`],
//       datasets: [
//         {
//           label: 'Bullish/Bearish Sentiment',
//           data: [bullish, bearish],
//           backgroundColor: ['Green', 'Red'],
//         },
//       ],
//     };

//     return {
//       totalBullish: bullish,
//       totalBearish: bearish,
//       data: data,
//     };
//   }

//   getFlowSentimentOverTime = (flow) => {
//     const labels = [];
//     const sentiment = [];
//     let sentimentCounter = 0;

//     for (var i = flow.length - 1; i >= 0; i--) {
//       labels.unshift(i + 1);

//       if (flow[i].sentiment === 'BULLISH') {
//         sentimentCounter += 1;
//       } else {
//         sentimentCounter -= 1;
//       }

//       sentiment.push(sentimentCounter);
//     }

//     return {
//       labels: labels,
//       datasets: [
//         {
//           label: 'Flow',
//           data: sentiment,
//           backgroundColor: ['Blue'],
//         },
//       ],
//     };
//   };
// }

// module.exports = Database;
