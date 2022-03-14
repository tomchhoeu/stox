import React from 'react';

import { Paper, Box, Typography } from '@mui/material';

const MAX_TITLE_LENGTH = 80;

const NewsCard = (props) => {
  const { title, date, url } = props;
  // cut off title if it's too long
  let new_title = title;
  if (title.length > MAX_TITLE_LENGTH) {
    new_title.slice(0, 80);
    new_title += '...';
  }

  return (
    <Paper variant="outlined" sx={{ marginBottom: '8px' }}>
      <Box p={'8px'}>
        <Typography variant="subtitle" component="div">
          <a
            href={url}
            style={{
              textDecoration: 'none',
              color: '#6FABC3',
            }}
          >
            {title.length > MAX_TITLE_LENGTH ? new_title : title}
          </a>
        </Typography>
        <Typography variant="caption" sx={{ mb: 1.5 }} color="text.secondary">
          {date}
        </Typography>
      </Box>
    </Paper>
  );
};

export default NewsCard;
