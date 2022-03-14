import React from 'react';

import { Paper, Box, Typography } from '@mui/material';

const SnapshotCard = (props) => {
  let { name, ppu, dolChange, perChange } = props;

  // add + to positive changes
  if (dolChange > 0) {
    dolChange = '+' + dolChange;
  }
  if (perChange > 0) {
    perChange = '+' + perChange;
  }

  return (
    <Paper variant="outlined" sx={{ width: '120px' }}>
      <Box p={'8px'}>
        <Typography
          variant="subtitle"
          sx={{ fontWeight: 'bold' }}
          component="div"
        >
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div">
          {ppu}
        </Typography>
        <Typography
          variant="caption"
          color={dolChange < 0 ? '#E05260' : '#84C318'}
        >
          {dolChange} ({perChange})
        </Typography>
      </Box>
    </Paper>
  );
};

export default SnapshotCard;
