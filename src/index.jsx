import React from 'react';
import ReactDOM from 'react-dom';
import Chart from 'chart.js';
import style from './style.css';

import TextAreaInput from './components/TextAreaInput.jsx';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            words: '',
            websites: '',
            countChart: null
        };

        this.onWordsChange = this.onWordsChange.bind(this);
        this.onWebsitesChange = this.onWebsitesChange.bind(this);
        this.search = this.search.bind(this);
        this.updateCountChart = this.updateCountChart.bind(this);

        this.chartRef = React.createRef();
    }

    componentDidMount() {
        const ctx = this.chartRef.current.getContext('2d');
        const countChart = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Word Count',
                    data: [],
                    backgroundColor: []
                }]
            }
        });

        this.setState({
            countChart
        });
    }

    onWordsChange(words) {
        this.setState({
            words
        });
    }

    onWebsitesChange(websites) {
        this.setState({
            websites
        });
    }

    async search() {
        const wordsArray = this.state.words.toLowerCase().split('\n');
        const websitesArray = this.state.websites.toLowerCase().split('\n');

        const uniqueWords = Array.from(new Set(wordsArray));
        const uniqueWebsites = Array.from(new Set(websitesArray));

        const wordCounts = await this.getWordCounts(uniqueWords, uniqueWebsites);
        this.updateCountChart(wordCounts);
    }

    async getWordCounts(words, websites) {
        try {
            const wordQueries = words.map(word => `words=${encodeURIComponent(word)}`);
            const websiteQueries = websites.map(website => `websites=${encodeURIComponent(website)}`);
            const res = await fetch(`/counts?${wordQueries.join('&')}&${websiteQueries.join('&')}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return await res.json();
        } catch (err) {
            console.error(err.message);
        }
    }

    updateCountChart(wordCounts) {
        const chart = this.state.countChart;

        wordCounts.sort((a, b) => {
            if (a.count < b.count) return 1;
            if (a.count > b.count) return -1;
            return 0;
        });
        chart.data.labels = wordCounts.map(word => `${word.word[0].toUpperCase()}${word.word.slice(1)}`);
        chart.data.datasets[0].data = wordCounts.map(word => word.count);

        const colours = ['#DAD6D6', '#92BFB1', '#F4AC45', '#694A38', '#A61C3C'];
        chart.data.datasets[0].backgroundColor = chart.data.labels.map(bar => {
            const randomIndex = Math.floor(Math.random() * colours.length);
            return colours[randomIndex];
        });

        chart.update();
    }

    render() {
        return (
            <div className="container">
                <div className="page">
                    <h1 className="page__title">Website Word Counter</h1>
                    <div className="input">
                        <TextAreaInput title="Words to search for" onTextChange={this.onWordsChange}></TextAreaInput>
                        <TextAreaInput title="Websites to search through" onTextChange={this.onWebsitesChange}></TextAreaInput>
                    </div>
                    <button className="search__btn" onClick={this.search}>Search</button>
                    <canvas height="128px" ref={this.chartRef}></canvas>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<App></App>, document.querySelector('#app'));