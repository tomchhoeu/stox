export const updateTrending = async (stock_code) => {
  try {
    // Increment trending score of this stock
    await fetch('http://localhost:8000/stock/trending/increment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        equitySymbol: stock_code,
      }),
    });
  } catch (err) {
    console.log(err);
  }
};
