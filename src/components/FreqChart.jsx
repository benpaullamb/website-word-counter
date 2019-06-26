import React from 'react';
import Chart from 'chart.js';

export default class FreqChart extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            freqChart: null
        };

        this.chartRef = React.createRef();
        this.updateFreqChart = this.updateFreqChart.bind(this);
    }

    componentDidMount() {
        const ctx = this.chartRef.current.getContext('2d');
        const freqChart = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Frequency',
                    data: [],
                    backgroundColor: []
                }]
            }
        });

        this.setState({
            freqChart
        });
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.wordCounts !== this.props.wordCounts;
    }

    render() {
        console.log('Re-rendering chart');
        this.updateFreqChart(this.props.wordCounts);
        return (
            <canvas height="128px" ref={this.chartRef}></canvas>
        );
    }

    updateFreqChart(wordCounts) {
        const chart = this.state.freqChart;
        if (!chart) return;

        wordCounts.sort((a, b) => {
            if (a.count < b.count) return 1;
            if (a.count > b.count) return -1;
            return 0;
        });
        chart.data.labels = wordCounts.map(res => `${res.word[0].toUpperCase()}${res.word.slice(1)}`);
        chart.data.datasets[0].data = wordCounts.map(word => word.count);

        const colours = ['#DAD6D6', '#92BFB1', '#F4AC45', '#694A38', '#A61C3C'];
        chart.data.datasets[0].backgroundColor = chart.data.labels.map(bar => {
            const randomIndex = Math.floor(Math.random() * colours.length);
            return colours[randomIndex];
        });

        chart.update();
    }
}