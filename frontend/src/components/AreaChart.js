import React, { Component } from 'react';
import Chart from 'react-apexcharts';

class AreaChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      options: {
        chart: {
          id: 'area-chart',
        },
        xaxis: {
          categories: this.props.time_series,
        },
        stroke: {
          curve: 'straight',
        },
      },
      series: [
        {
          name: 'stock-data',
          data: this.props.data_series,
        },
      ],
    };
  }

  render() {
    //console.log(this.props.time_series)
    return (
      <Chart
        options={this.state.options}
        series={this.state.series}
        type="area"
      />
    );
  }
}

export default AreaChart;
