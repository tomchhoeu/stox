const { getQuoteEndpoint } = require('../alphaVantageAPI');

exports.getSummaryHelper = async (portfolio) => {
  let dailyLastSum = 0.0;
  let dailyChange = 0.0;
  let portfolioBuySum = 0.0;
  //console.log(portfolio.stocks);
  const retrieveResults = async (stock) => {
    const stockInfo = await getQuoteEndpoint(stock.equitySymbol);
    // Some sort of check in case the stock cannot be found through API, or if the API just doesn't
    // return anything.
    // TODO: Fix solution to make it more elegant
    let stockBuyPrice = 0;
    let stockDailyLast = 0;
    let stockDailyChange = 0;
    stockBuyPrice = parseFloat(stock.buyPrice) * stock.amount;
    console.log(stockInfo['Global Quote']['05. price']);
    if (stockInfo['Global Quote']['05. price'] != undefined) {
      //console.log("hahahahah");
      stockDailyLast =
        parseFloat(stockInfo['Global Quote']['05. price']) * stock.amount;
      stockDailyChange =
        parseFloat(stockInfo['Global Quote']['09. change']) * stock.amount;
    }
    return {
      stockBuyPrice,
      stockDailyLast,
      stockDailyChange,
    };
  };
  for (const stock of portfolio.stocks) {
    //console.log(stock)
    //console.log("loop")
    try {
      //console.log("before")
      const result = await retrieveResults(stock);
      //console.log(result)
      dailyLastSum += result.stockDailyLast;
      dailyChange += result.stockDailyChange;
      portfolioBuySum += result.stockBuyPrice;
      //console.log("this should have awaited hahahahaah")
    } catch (err) {
      console.log(err);
    }
  }
  // Calculate and return float and percentage change

  const totalChange = dailyLastSum - portfolioBuySum;
  const totalChangePercentage = portfolioBuySum
    ? ((totalChange / portfolioBuySum) * 100).toFixed(2)
    : 0;
  const dailyChangePercentage = dailyLastSum
    ? ((dailyChange / dailyLastSum) * 100).toFixed(2)
    : 0;

  const payload = {
    dailyChange,
    dailyChangePercentage,
    dailyLastSum,
    totalChange,
    totalChangePercentage,
    portfolioBuySum,
  };
  //console.log("aaahaaaa")
  //console.log(payload)
  return payload;
};
