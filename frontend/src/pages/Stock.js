import React from 'react';

import Chart from 'react-apexcharts';
import NewsList from '../components/NewsList';
import SentimentCard from '../components/SentimentCard';
import StockData from '../components/StockData';

import { Typography, Container, TextField, Grid, Paper } from '@mui/material';

import { updateTrending } from '../helpers/TrendingHelpers';

const Stock = () => {
  const loc = window.location.href.split('/');
  const stock_code = loc[loc.length - 1];

  const [info, setInfo] = React.useState({});
  const [options, setOptions] = React.useState({});
  const [series, setSeries] = React.useState([]);

  // Update trending status for this stock
  React.useEffect(() => {
    updateTrending(stock_code);
  }, []);

  // Get data for rendering correct data
  React.useEffect(() => {
    const getInfo = async function () {
      try {
        // GET stock code to stockinfo route
        const res = await fetch(`http://localhost:8000/stock/${stock_code}`);
        // Get history for a stock code
        const hist_res = await fetch(
          `http://localhost:8000/stock/history/${stock_code}`
        );

        // check response status/code
        if (!res.ok || !hist_res.ok) {
          console.log('call failed!');
          return;
        }

        // get response back (should be stock info payload)
        const json = await res.json();
        const hist_json = await hist_res.json();
        console.log(hist_json);
        setInfo(json);

        const chart_config = {
          options: {
            chart: {
              id: 'area-chart',
            },
            xaxis: {
              categories: hist_json['time_series'],
            },
            stroke: {
              curve: 'straight',
            },
            title: {
              text: 'Intraday stock price',
            },
          },
          series: [
            {
              name: 'stock-data',
              data: hist_json['data_series'],
            },
          ],
        };

        setOptions(chart_config.options);
        setSeries(chart_config.series);
      } catch (err) {
        console.log(err);
      }
    };
    getInfo();
  }, [stock_code]);

  return (
    <Container component="main" maxWidth="lg" className="main">
      <Typography variant="h5" noWrap style={{ marginBottom: '30px' }}>
        {info['name']} {'('}
        {stock_code}
        {')'}
      </Typography>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item sx={12} md={8} lg={8}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 600,
              }}
            >
              <StockData stock_code={stock_code} />
              <Chart options={options} series={series} type="area" />
            </Paper>
          </Grid>
          <Grid item sx={12} md={4} lg={4}>
            <Grid container spacing={3} direction="row">
              <Grid item sx={12} md={12} lg={12}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'scroll',
                    height: 400,
                  }}
                >
                  {/* NEWS LIST CARD */}
                  <NewsList stock={stock_code} />
                </Paper>
              </Grid>
              <Grid item sx={12} md={12} lg={12}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 176,
                  }}
                >
                  {'Sentiment'}
                  <SentimentCard stock={stock_code} />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
};

export default Stock;
