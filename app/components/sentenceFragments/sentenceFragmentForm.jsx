import React from 'react';

const sentenceFragmentForm = React.createClass({
  renderOptimalResponseTextInput: function () {
    if (this.props.data.isFragment) {
      return (
        [
          (<label className="label">Optimal Answer Text (The most obvious short answer, you can add more later)</label>),
          (<p className="control">
            <input className="input" type="text" value={this.props.data.optimalResponseText} onChange={this.props.handleChange.bind(null, "optimalResponseText")}></input>
          </p>)
        ]
      )
    }
  },

  render: function () {
    return (
      <div>
        <label className="label">Sentence / Fragment Text</label>
        <p className="control">
          <input className="input" type="text" value={this.props.data.prompt} onChange={this.props.handleChange.bind(null, "prompt")}></input>
        </p>
        <p className="control">
          <label className="checkbox">
            <input type="checkbox" checked={this.props.data.isFragment} onClick={this.props.handleChange.bind(null, "isFragment")}/>
            Is this a Fragment?
          </label>
        </p>
        {this.renderOptimalResponseTextInput()}
        <button className="button is-primary is-outlined" onClick={this.props.submit}>Save</button>
      </div>
    )
  }
})

export default sentenceFragmentForm
