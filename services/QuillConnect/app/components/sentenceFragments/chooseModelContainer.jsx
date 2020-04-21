import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';
import ConceptSelector from '../shared/conceptSelector.jsx';
import { ConceptExplanation } from 'quill-component-library/dist/componentLibrary';
import sentenceFragmentActions from '../../actions/sentenceFragments';

class ChooseModelContainer extends Component {
  constructor(props) {
    super(props);
    const { params, sentenceFragments } = props
    const { data } = sentenceFragments
    const { questionID } = params
    this.state = {
      modelConceptUID: data[questionID].modelConceptUID
    }
  }

  getModelConceptUID = () => {
    return this.state.modelConceptUID || this.props.sentenceFragments.data[this.props.params.questionID].modelConceptUID;
  }

  removeModelConcept = () => {
    let questionData = Object.assign({}, this.props.sentenceFragments.data[this.props.params.questionID], {modelConceptUID: null});
    this.props.dispatch(sentenceFragmentActions.submitSentenceFragmentEdit(this.props.params.questionID, questionData));
  };

  saveModelConcept = () => {
    this.props.dispatch(sentenceFragmentActions.submitSentenceFragmentEdit(this.props.params.questionID,
      Object.assign({}, this.props.sentenceFragments.data[this.props.params.questionID], {modelConceptUID: this.state.modelConceptUID})));
    window.history.back();
  };

  selectConcept = e => {
    this.setState({modelConceptUID: e.value});
  };

  renderButtons = () => {
    return(
      <p className="control">
        <button
          className={'button is-primary'}
          disabled={this.state.modelConceptUID == this.props.sentenceFragments.data[this.props.params.questionID].modelConceptUID ? 'true' : null}
          onClick={this.saveModelConcept}
        >
          Save Model Concept
        </button>
        <button
          className={'button is-outlined is-info'}
          onClick={() => window.history.back()}
          style={{marginLeft: 5}}
        >
          Cancel
        </button>
        <button
          className="button is-outlined is-danger"
          onClick={this.removeModelConcept}
          style={{marginLeft: 5}}
        >
          Remove
        </button>
      </p>
    )
  }

  render() {
    return(
      <div className="box">
        <h4 className="title">Choose Model</h4>
        <div className="control">
          <ConceptSelector currentConceptUID={this.getModelConceptUID()} handleSelectorChange={this.selectConcept} onlyShowConceptsWithConceptFeedback />
          <ConceptExplanation {...this.props.conceptsFeedback.data[this.getModelConceptUID()]} />
          {this.props.children}
        </div>
        {this.renderButtons()}
      </div>
    )
  }
}

function select(props) {
  return {
    sentenceFragments: props.sentenceFragments,
    conceptsFeedback: props.conceptsFeedback
  };
}

export default connect(select)(ChooseModelContainer);
