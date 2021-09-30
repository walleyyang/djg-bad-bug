class DataModifier {
  getJsonString = (filteredData) => {
    return JSON.stringify({
      time: filteredData[0],
      symbol: filteredData[1],
      expiration: filteredData[2],
      strike: filteredData[3],
      position: filteredData[4],
      stockPrice: filteredData[5],
      details: filteredData[6].replace('_', ' '),
      type: filteredData[7],
      value: filteredData[8],
      estimatedValue: this.getEstimatedValue(filteredData[8]),
      goldenSweep: this.getGoldenSweep(
        this.getEstimatedValue(filteredData[8]),
        filteredData[7]
      ),
    });
  };

  getJsonObject = (jsonString) => {
    return JSON.parse(jsonString);
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

  getGoldenSweep = (estimatedValue, type) => {
    return estimatedValue >= 1000000 && type === 'SWEEP';
  };

  verifyData = (data) => {
    const minDataLength = 11;
    const dataKeys = [
      'time',
      'symbol',
      'expiration',
      'strike',
      'position',
      'stockPrice',
      'details',
      'type',
      'value',
      'estimatedValue',
      'goldenSweep',
    ];

    let validData = true;

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

        if (!validData) break;
      }
    }

    return validData;
  };

  verifyFilter = (data) => {
    return data['estimatedValue'] >= 100000;
  };
}

module.exports = DataModifier;
