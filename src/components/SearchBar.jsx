import React from 'react';

export default class SearchBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({
            value: event.target.value
        });

        this.props.onChange(event.target.value);
    }

    render() {
        return (
            <div className="search">
                <span className="search__label">Google Search</span>
                <input value={this.state.value} onChange={this.handleChange} type="text" className="search__bar" />
            </div>
        );
    }
}