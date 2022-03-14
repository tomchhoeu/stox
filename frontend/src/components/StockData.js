import React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { display } from '@mui/system';

const StockData = ({ stock_code }) => {
  const [info, setInfo] = React.useState({});

  React.useEffect(() => {
    const getInfo = async function () {
      try {
        // GET stock code to stockinfo route
        const res = await fetch(`http://localhost:8000/stock/${stock_code}`);

        // check response status/code
        if (!res.ok) {
          console.log('call failed!');
          return;
        }

        // get response back (should be stock info payload)
        const json = await res.json();
        setInfo(json);
      } catch (err) {
        console.log(err);
      }
    };
    getInfo();
  }, [stock_code]);

  return (
    <div>
      <Typography variant="h4" noWrap sx={{ mb: '10px' }} display="inline">
        ${parseFloat(info['price']).toFixed(2)}
      </Typography>
      <h2
        style={
          info['change'] < 0
            ? { color: '#E05260', display: 'inline' }
            : { color: '#84C318', display: 'inline' }
        }
      >
        {' '}
        {info['change'] < 0 ? '' : '+'}
        {parseFloat(info['change']).toFixed(2)}
        {' ('}
        {info['change'] < 0 ? '' : '+'}
        {parseFloat(info['change_percent']).toFixed(2)}
        {'%)'}
      </h2>

      <Table size="small" sx={{ mt: '5px' }}>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={1}
              align="left"
              sx={{ fontWeight: 'bold' }}
              style={{ borderBottom: 'none' }}
            >
              Previous close:
            </TableCell>
            <TableCell
              colSpan={1}
              align="left"
              style={{ borderBottom: 'none' }}
            >
              ${parseFloat(info['prev_close']).toFixed(2)}
            </TableCell>
            <TableCell
              colSpan={2}
              align="left"
              sx={{ fontWeight: 'bold' }}
              style={{ borderBottom: 'none' }}
            >
              Daily high:
            </TableCell>
            <TableCell style={{ borderBottom: 'none' }}>
              ${parseFloat(info['high']).toFixed(2)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              colSpan={1}
              align="left"
              sx={{ fontWeight: 'bold' }}
              style={{ borderBottom: 'none' }}
            >
              Open:
            </TableCell>
            <TableCell
              colSpan={1}
              align="left"
              style={{ borderBottom: 'none' }}
            >
              ${parseFloat(info['open']).toFixed(2)}
            </TableCell>
            <TableCell
              colSpan={2}
              align="left"
              sx={{ fontWeight: 'bold' }}
              style={{ borderBottom: 'none' }}
            >
              Daily low:
            </TableCell>
            <TableCell style={{ borderBottom: 'none' }}>
              ${parseFloat(info['low']).toFixed(2)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              sx={{ fontWeight: 'bold' }}
              style={{ borderBottom: 'none' }}
            >
              Volume:
            </TableCell>
            <TableCell style={{ borderBottom: 'none' }}>
              {info['volume']}
            </TableCell>
            <TableCell
              colSpan={2}
              align="left"
              sx={{ fontWeight: 'bold' }}
              style={{ borderBottom: 'none' }}
            >
              Sector:
            </TableCell>
            <TableCell style={{ borderBottom: 'none' }}>
              {info['sector']}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default StockData;
