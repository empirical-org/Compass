"use strict;"
EC.DatePicker = React.createClass({

  componentDidMount: function () {
    $(this.refs.date.getDOMNode()).datepicker({
      selectOtherMonths: true,
      dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      dateFormat: 'mm-dd-yy',
      altField: ('#railsFormatDate' + this.props.key),
      altFormat: 'yy-mm-dd',
      onSelect: this.handleChange
    });
  },

  handleChange: function () {
    var x1 = '#railsFormatDate' + this.props.key;
    var dom = $(x1);
    var val = dom.val();
    this.props.handleChange(val);
  },

  render: function () {
    return (
      <span className="datepicker-container">
        <input
          type="text"
          ref="date"
          className="datepicker-input"
          placeholder={this.props.placeHolder}
          onChange={this.handleChange} />
        <input
          type="text"
          ref="railsFormatDate"
          id={"railsFormatDate" + this.props.key}
          className="railsFormatDate"
          onChange={this.handleChange} />
      </span>
    );
  }
});