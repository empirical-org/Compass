import React from 'react';
import { Spinner } from 'quill-component-library/dist/componentLibrary';
import translations from '../../libs/translations/index.js';

export default React.createClass({

  componentDidMount() {
    this.props.saveToLMS();
  },

  getCompletedPageHTML() {
    let html = translations.english['completion page'];
    if (this.props.language !== 'english') {
      const textClass = this.props.language === 'arabic' ? 'right-to-left arabic-title-div' : '';
      html += `<br/><div class="${textClass}">${translations[this.props.language]['completion page']}</div>`;
    }
    return html;
  },

  renderSavedIndicator() {
    if (this.props.saved) {
      return (
        <div>
          Saved Diagnostic
        </div>
      );
    } else {
      return (
        <div>
          Saving Diagnostic
        </div>
      );
    }
  },

  renderErrorState() {
    let header
    let message
    if (this.props.error === "Activity Session Already Completed") {
      header = "This Activity Session Has Already Been Completed"
      message = (<p>
        The activity session with this unique identifier has already been&nbsp;completed.<br />
        In order to redo this activity, you must return to your dashboard and click "Replay Activity".<br />
        If you believe that you have received this message in error, ask your teacher to contact Quill.<br />
        Please provide the following URL to help us solve the problem.
        </p>)
    } else {
      header = "We Couldn't Save Your Activity Session."
      message = (<p>Your results could not be saved. <br />
        Make sure you are connected to the internet.<br />
        You can attempt to save again using the button below.<br />
        If the issue persists, ask your teacher to contact Quill.<br />
        Please provide the following URL to help us solve the problem.
      </p>)
    }
    return (
      <div className="landing-page">
        <h1>{header}</h1>
        {message}
        <p><code style={{ fontSize: 14, }}>
          {window.location.href}
        </code></p>
        <button className="button is-info is-large" onClick={this.props.saveToLMS}>Retry</button>
      </div>
    );
  },

  render() {
    if (this.props.error) {
      return this.renderErrorState()
    } else {
      return (
        <div className="landing-page">
          <div dangerouslySetInnerHTML={{ __html: this.getCompletedPageHTML(), }} />
          <Spinner />
        </div>
      );
    }
  },

});
