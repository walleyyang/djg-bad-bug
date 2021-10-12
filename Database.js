const { MongoClient } = require('mongodb');

const Config = require('./config.json');

class Database {
  client;
  database = process.env.MONGO_INITDB_DATABASE;
  collection = process.env.MONGO_COLLECTION;
  call = Config.position.call;
  put = Config.position.put;

  connect = async () => {
    const username = process.env.MONGO_INITDB_ROOT_USERNAME;
    const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
    const location = process.env.MONGO;
    const port = process.env.MONGO_PORT;
    const uri = `mongodb://${username}:${password}@${location}:${port}/${this.database}`;
    this.client = new MongoClient(uri);

    try {
      console.log('Connecting to MongoDB...');
      await this.client.connect();
      console.log('Successfully connected to MongoDB');
    } catch (err) {
      console.log(err);
    }
  };

  insert = async (dataJsonString) => {
    const data = JSON.parse(dataJsonString);
    const collection = this.client
      .db(this.database)
      .collection(this.collection);

    const result = await collection.find({ symbol: data.symbol });

    if (await result.hasNext()) {
      const doc = await result.toArray();
      const updatedStrikes = this.getUpdatedStrikes(data, doc[0].strikes);
      const updatedFlow = this.getUpdatedFlow(data, doc[0].flow);
      const updatedDoc = await collection.updateOne(
        { symbol: data.symbol },
        { $set: { strikes: updatedStrikes, flow: updatedFlow } }
      );
    } else {
      await collection.insertOne(this.getDocument(data));
    }
  };

  getDocument = (data) => {
    return JSON.parse(
      JSON.stringify({
        symbol: data.symbol,
        strikes: [this.getNewStrike(data)],
        flow: [this.getNewFlow(data)],
      })
    );
  };

  getUpdatedStrikes = (data, strikes) => {
    const position = data.position;
    const estimatedValue = data.estimatedValue;
    const strike = data.strike;

    for (let s of strikes) {
      if (s.strike === strike) {
        position === this.call
          ? (s.callsValue += parseInt(estimatedValue))
          : (s.putsValue += parseInt(estimatedValue));
      }
    }

    const updatedStrikes = [...strikes];
    let strikeExist = false;

    for (let s of updatedStrikes) {
      if (s.strike === strike) {
        strikeExist = true;
      }
    }

    if (!strikeExist) {
      updatedStrikes.push(this.getNewStrike(data));
    }

    return updatedStrikes;
  };

  getUpdatedFlow = (data, flow) => {
    flow.unshift(this.getNewFlow(data));

    return flow;
  };

  getNewStrike = (data) => {
    return JSON.parse(
      JSON.stringify({
        strike: data.strike,
        callsValue:
          data.position === this.call ? parseInt(data.estimatedValue) : 0,
        putsValue:
          data.position === this.put ? parseInt(data.estimatedValue) : 0,
      })
    );
  };

  getNewFlow = (data) => {
    return JSON.parse(
      JSON.stringify({
        sentiment: data.sentiment,
        value: data.value,
        position: data.position,
        details: data.details,
        type: data.type,
        strike: data.strike,
        expiration: data.expiration,
        time: data.time,
      })
    );
  };
}

module.exports = Database;
