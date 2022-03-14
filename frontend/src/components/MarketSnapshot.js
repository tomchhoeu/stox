import React from 'react';

import SnapshotCard from './SnapshotCard';

const indicators = [
  {
    id: 0,
    name: 'Dow Jones',
    ppu: 34746.25,
    dolChange: -8.69,
    perChange: -0.025,
  },
  {
    id: 1,
    name: 'S&P 500',
    ppu: 4391.34,
    dolChange: -8.42,
    perChange: -0.19,
  },
  {
    id: 2,
    name: 'Nasdaq',
    ppu: 14579.54,
    dolChange: 74.48,
    perChange: 0.51,
  },
];

const StocksSnapshot = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
      {indicators.map((indi) => (
        <SnapshotCard
          key={indi.id}
          name={indi.name}
          ppu={indi.ppu}
          dolChange={indi.dolChange}
          perChange={indi.perChange}
        />
      ))}
    </div>
  );
};

export default StocksSnapshot;
