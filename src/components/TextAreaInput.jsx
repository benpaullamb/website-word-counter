import React from 'react';

export default class TextAreaInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };
        this.onTextChange = this.onTextChange.bind(this);
    }

    onTextChange(event) {
        this.setState({
            value: event.target.value
        });
        this.props.onTextChange(event.target.value);
    }

    render() {
        return (
            <div className="input__section">
                <span className="input__label">{this.props.title}</span>
                <textarea value={this.state.value} onChange={this.onTextChange} cols="30" rows="10" className="input__text"></textarea>
            </div>
        );
    }
}