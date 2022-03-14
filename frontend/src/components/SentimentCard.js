import React from 'react';

import { Paper, Box, Typography } from '@mui/material';

const SentimentCard = ({ stock }) => {
  const [senStr, setSenStr] = React.useState('');
  React.useEffect(() => {
    const getSen = async () => {
      setSenStr('');
      const senRes = await fetch(`http://localhost:8000/news/summary/${stock}`);
      if (!senRes.ok) {
        console.log('failed to get sentiment res', senRes.status);
        return {};
      }

      // Convert numerical sentiment to textual
      await senRes.json().then((r) => {
        const avg_sen = r.sent.sen / r.sent.n_tot;
        let tmp_str = 'Unknown';
        switch (true) {
          case avg_sen > 1:
            tmp_str = 'Very positive';
            break;
          case avg_sen > 0.5:
            tmp_str = 'Slightly positive';
            break;
          case avg_sen > -0.5:
            tmp_str = 'Fairly neutral';
            break;
          case avg_sen > -1:
            tmp_str = 'Slightly negative';
            break;
          case avg_sen <= -1:
            tmp_str = 'Very negative';
            break;
          default:
            tmp_str = 'Unknown';
        }
        const str = `Sentiment: ${tmp_str} (${avg_sen.toPrecision(3)}), \
            with ${r.sent.n_pos} positive articles, ${
          r.sent.n_neg
        } negative articles, \
            and ${r.sent.n_neu} neutral articles.`;
        setSenStr(str);
      });
    };

    getSen();
  }, [stock]);

  return (
    <Paper variant="outlined" sx={{ marginBottom: '8px' }}>
      <Box p={'8px'}>
        <Typography variant="subtitle" component="div">
          {senStr}
        </Typography>
      </Box>
    </Paper>
  );
};

export default SentimentCard;
