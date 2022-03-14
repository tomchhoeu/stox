import React from 'react';
import { Link } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  CircularProgress,
  IconButton,
  Container,
  Grid,
  Typography,
  Paper,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';

import StockLink from '../components/StockLink';

const Insights = () => {
  const [stocks, setStocks] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [overview, setOverview] = React.useState('');
  const [trends, setTrends] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // update row data on initial render and when stocks first changes
  React.useEffect(() => {
    const updateData = async () => {
      setLoading(true);
      setRows([]);
      console.log('getting trending');
      let stocks = [];
      try {
        // GET trending stocks
        const res = await fetch('http://localhost:8000/stock/trending/top');
        const json = await res.json();
        stocks = json.stocks;
      } catch (err) {
        console.log(err);
      }

      let asyncCalls = stocks.map(async (stock) => {
        try {
          // GET current stock data
          const data_res = await fetch(`http://localhost:8000/stock/${stock}`);
          const sent_res = await fetch(
            `http://localhost:8000/news/summary/${stock}`
          );
          const aroon_res = await fetch(
            `http://localhost:8000/stock/AROONOSC/${stock}`
          );
          // check response status/code
          if (!data_res.ok || !sent_res.ok || !aroon_res.ok) {
            console.log('call failed!');
            console.log(
              data_res.statusText,
              sent_res.statusText,
              aroon_res.statusText
            );
            return {};
          }
          const stock_data = await data_res.json();
          const senti_data = await sent_res.json();
          const aroon_data = await aroon_res.json();
          return { stock_data, senti_data, aroon_data };
        } catch (err) {
          console.log(err);
        }
      });

      console.log('starting async calls');

      Promise.all(asyncCalls).then((data) => {
        if (Object.entries(data).length === 0) {
          return;
        }
        // once finished async calls, update rows with the data
        let n_articles = 0;
        let n_sources = 0;
        let n_pos = 0;
        let n_neg = 0;
        let n_neu = 0;
        let n_up = 0;
        let n_down = 0;
        let n_trend_up = 0;
        let n_trend_down = 0;
        Object.values(data).forEach((val) => {
          if (Object.entries(val).length === 0) {
            return;
          }
          if (Object.entries(val.aroon_data).length !== 0) {
            n_pos += val.senti_data.sent.n_pos;
            n_neg += val.senti_data.sent.n_neg;
            n_neu += val.senti_data.sent.n_neu;
            n_articles += val.senti_data.sent.n_tot;
            n_sources += val.senti_data.sent.n_uni;
            n_up += parseFloat(val.stock_data.change_percent) > 0 ? 1 : 0;
            n_down += parseFloat(val.stock_data.change_percent) < 0 ? 1 : 0;
            n_trend_up += val.aroon_data.AROON.AROONOSC > 0 ? 1 : 0;
            n_trend_down += val.aroon_data.AROON.AROONOSC < 0 ? 1 : 0;
            const row = {
              code: val.stock_data.code,
              name: val.stock_data.name,
              ppu: val.stock_data.price
                ? parseFloat(val.stock_data.price).toFixed(2)
                : 0,
              perChange: val.stock_data.change_percent
                ? parseFloat(
                    val.stock_data.change_percent.slice(0, -1)
                  ).toFixed(2)
                : 0,
              trend: val.aroon_data.AROON.AROONOSC,
              sentiment: (
                val.senti_data.sent.sen / val.senti_data.sent.n_tot
              ).toFixed(2),
            };
            setRows((rows) => [...rows, row]);
          }
        });
        setOverview(
          `Over the last week:\n${n_articles} news articles analysed,\n${n_sources} unique sources,\n${n_pos} positive articles,\n${n_neg} negative articles,\n${n_neu} neutral articles.`
        );
        setTrends(
          `Of the stocks shown:\n${n_up} went up,\n${n_down} went down,\n${n_trend_up} stocks are trending up,\n${n_trend_down} are trending down`
        );
        setLoading(false);
      });
    };
    updateData();
  }, [stocks]);

  const handleSearch = async () => {
    console.log(`searching for: ${search}`);

    setLoading(true);

    try {
      // GET search endpoint
      const res = await fetch(`http://localhost:8000/stock/search/${search}`);
      // check response status/code
      if (!res.ok) {
        console.log('call failed!');
        return;
      }
      const data = await res.json();
      console.log(data);
      // cut search results to only first 10 entries
      data['codes'].slice(0, 10);
      // update stocks codes with the search results
      setStocks(data['codes']);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="lg" className="main">
      <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={9} lg={9}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 600,
              }}
            >
              {/* Search bar */}
              <TextField
                name="search"
                fullWidth
                size="small"
                id="search-bar"
                label="Search for a stock..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
                onKeyPress={(ev) => {
                  if (ev.key === 'Enter') {
                    ev.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <Table size="small" sx={{ mt: '10px' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">
                      $/unit
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">
                      % change
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">
                      Weekly Trend (AROON)
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">
                      Weekly Sentiment
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableCell
                      colSpan="6"
                      align="center"
                      height="300px"
                      variant="footer"
                    >
                      <CircularProgress />
                    </TableCell>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={row.code}>
                        <TableCell>
                          {/* <Link to={`/stock/${row.code}`}> {row.code} </Link> */}
                          <StockLink code={row.code} />
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell align="right">{row.ppu}</TableCell>
                        <TableCell
                          sx={{
                            color:
                              row.perChange < 0 ? 'error.main' : 'success.main',
                          }}
                          align="right"
                        >
                          {row.perChange}
                        </TableCell>
                        <TableCell
                          sx={{
                            color:
                              row.trend < 0 ? 'error.main' : 'success.main',
                          }}
                          align="right"
                        >
                          {row.trend}
                        </TableCell>
                        <TableCell
                          sx={{
                            color:
                              row.sentiment < 0 ? 'error.main' : 'success.main',
                          }}
                          align="right"
                        >
                          {row.sentiment}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3} lg={3}>
            <Grid container spacing={3} direction="row">
              <Grid item sx={12} md={12} lg={12}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 300,
                  }}
                >
                  <Typography variant="h5" style={{ marginBottom: '30px' }}>
                    Sources
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      height: 300,
                    }}
                  >
                    <Typography
                      variant="body1"
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {overview}
                    </Typography>
                  </Paper>
                </Paper>
              </Grid>

              <Grid item sx={12} md={12} lg={12}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 276,
                  }}
                >
                  <Typography variant="h5" style={{ marginBottom: '30px' }}>
                    Trends
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      height: 300,
                    }}
                  >
                    <Typography
                      variant="body1"
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {trends}
                    </Typography>
                  </Paper>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
};

export default Insights;
