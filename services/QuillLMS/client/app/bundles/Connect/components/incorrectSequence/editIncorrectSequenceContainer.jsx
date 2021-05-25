import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';
import IncorrectSequencesInputAndConceptSelectorForm from '../shared/incorrectSequencesInputAndConceptSelectorForm.jsx';
import questionActions from '../../actions/questions';
import sentenceFragmentActions from '../../actions/sentenceFragments';

class EditIncorrectSequencesContainer extends Component {
  constructor() {
    super();

    const questionType = window.location.href.includes('sentence-fragments') ? 'sentenceFragments' : 'questions'
    const questionTypeLink = questionType === 'sentenceFragments' ? 'sentence-fragments' : 'questions'
    const actionFile = questionType === 'sentenceFragments' ? sentenceFragmentActions : questionActions

    this.state = {
      questionType,
      questionTypeLink,
      actionFile
    }
  }

  componentDidMount() {
    const { actionFile } = this.state
    const { getUsedSequences } = actionFile
    const { dispatch, generatedIncorrectSequences, match } = this.props
    const { used } = generatedIncorrectSequences
    const { params } = match
    const { questionID } = params
    if (!used[questionID] && getUsedSequences) {
      dispatch(actionFile.getUsedSequences(questionID))
    }
  }

  getIncorrectSequence = () => {
    const { questionType } = this.state
    const { match } = this.props
    const { params } = match
    const { incorrectSequenceID, questionID } = params
    return this.props[questionType].data[questionID].incorrectSequences[incorrectSequenceID];
  }

  submitForm = (data, incorrectSequenceID) => {
    const { actionFile } = this.state
    const { submitEditedIncorrectSequence } = actionFile
    const { dispatch, match } = this.props
    const { params } = match
    const { questionID } = params
    delete data.conceptResults.null;
    dispatch(submitEditedIncorrectSequence(questionID, data, incorrectSequenceID));
    setTimeout(() => {window.history.back()}, 2000);
  };

  render() {
    const { generatedIncorrectSequences, match, questions, sentenceFragments } = this.props
    const { params } = match
    const { incorrectSequenceID, questionID } = params
    return (
      <div>
        <IncorrectSequencesInputAndConceptSelectorForm
          item={Object.assign(this.getIncorrectSequence(), { id: incorrectSequenceID, })}
          itemLabel='Incorrect Sequence'
          onSubmit={this.submitForm}
          questionID={questionID}
          questions={questions}
          sentenceFragments={sentenceFragments}
          states
          usedSequences={generatedIncorrectSequences.used[questionID]}
        />
      </div>
    );
  }
}

function select(props) {
  return {
    questions: props.questions,
    generatedIncorrectSequences: props.generatedIncorrectSequences,
    sentenceFragments: props.sentenceFragments,
    states: props.states
  };
}

export default connect(select)(EditIncorrectSequencesContainer);
