import React from 'react';
import ReactDOM from 'react-dom';
import style from './style.css';

import loadingImage from './images/loading.png';
import TextAreaInput from './components/TextAreaInput.jsx';
import SearchBar from './components/SearchBar.jsx';
import FreqChart from './components/FreqChart.jsx';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            words: '',
            search: '',
            countChart: null,
            isSearching: false,
            wordCounts: []
        };

        this.search = this.search.bind(this);
        this.getWordCounts = this.getWordCounts.bind(this);
    }

    render() {
        return (
            <div className="container">
                <div className="page">
                    <h1 className="page__title">Web Word Counter</h1>
                    <div className="input">
                        <TextAreaInput title="Words to search for" onTextChange={words => this.setState({ words })}></TextAreaInput>
                        <SearchBar onChange={search => this.setState({ search })}></SearchBar>
                    </div>
                    <div className="process">
                        <button className="process__btn" onClick={this.search}>Search</button>
                        <img src={loadingImage} alt="Loading" className={'process__icon ' + (this.state.isSearching ? 'process__icon--spin' : 'process__icon--hidden')} />
                    </div>
                    <FreqChart wordCounts={this.state.wordCounts}></FreqChart>
                </div>
            </div>
        );
    }

    async search() {
        this.setState({
            isSearching: true
        });
        const wordsArray = this.state.words.toLowerCase().split('\n');
        const uniqueWords = Array.from(new Set(wordsArray));
        const wordCounts = await this.getWordCounts(uniqueWords, this.state.search);
        this.setState({
            wordCounts,
            isSearching: false
        });
    }

    async getWordCounts(words, search) {
        try {
            const wordQueries = words.map(word => `words=${encodeURIComponent(word)}`);
            const searchQuery = search.replace(/\s/gi, '+');
            const res = await fetch(`/counts?${wordQueries.join('&')}&search=${searchQuery}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return await res.json();
        } catch (err) {
            console.error(err.message);
        }
    }
}

ReactDOM.render(<App></App>, document.querySelector('#app'));