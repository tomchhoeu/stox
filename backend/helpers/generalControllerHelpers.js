const { getCompanyOverview } = require('../alphaVantageAPI');

exports.checkIfStock = async function (inputSymbol) {
  try {
    const result = await getCompanyOverview(inputSymbol);
    
    // If the object is null, or contains no properties, then return false.
    if (result == null) {
      return false;
    }
    if (Object.keys(result).length == 0) {
      return false;
    }
    
    // If these checks pass, then return true.
    return true;
  
  } catch (err) {
    // If an error occurs, then just return false.
    return false;
  }
};
