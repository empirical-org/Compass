import React from 'react'
import createReactClass from 'create-react-class';
import moment from 'moment';

export default createReactClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    onClickFunction: React.PropTypes.func.isRequired
  },

  render: function() {
    const selected = this.props.selected ? 'selected' : ''
    return (
      <div className={`calendar-prefill-option ${selected}`} onClick={this.props.onClickFunction}>{this.props.title}</div>
    );
  }
})
