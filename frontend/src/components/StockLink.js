import React from 'react';

import { Link } from 'react-router-dom';

const StockLink = ({ code }) => {
  return (
    <Link
      to={`/stock/${code}`}
      style={{
        textDecoration: 'none',
        fontWeight: 'bold',
        color: '#6FABC3',
      }}
    >
      {' '}
      {code}{' '}
    </Link>
  );
};

export default StockLink;
