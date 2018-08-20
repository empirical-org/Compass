import * as React from 'react'
import {
  hashToCollection,
  FlagDropdown
} from 'quill-component-library/dist/componentLibrary';
import { connect } from 'react-redux'
import TextEditor from '../shared/textEditor'
import * as questionActions from '../../actions/questions'
import { Link } from 'react-router-dom';
import { EditorState, ContentState } from 'draft-js'
import _ from 'underscore'

class Concept extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      prompt: '',
      concept_uid: this.props.match.params.conceptID,
      instructions: '',
      flag: 'alpha',
      rule_description: '',
      answers: []
    }

    this.submit = this.submit.bind(this)
    this.handlePromptChange = this.handlePromptChange.bind(this)
    this.handleInstructionsChange = this.handleInstructionsChange.bind(this)
    this.handleRuleDescriptionChange = this.handleRuleDescriptionChange.bind(this)
    this.handleSelectorChange = this.handleSelectorChange.bind(this)
    this.handleConceptChange = this.handleConceptChange.bind(this)
    this.handleFlagChange = this.handleFlagChange.bind(this)
    this.handleAnswersChange = this.handleAnswersChange.bind(this)
  }

  getConcept() {
    const {data} = this.props.concepts, {conceptID} = this.props.match.params;
    return _.find(data['0'], {uid: conceptID})
  }

  questionsForConcept() {
    const questionsCollection = hashToCollection(this.props.questions.data)
    return _.where(questionsCollection, {concept_uid: this.props.match.params.conceptID})
  }

  renderQuestionsForConcept() {
    const questionsForConcept = this.questionsForConcept()
    const listItems = questionsForConcept.map((question) => {
      return (<li key={question.key}><Link to={'/admin/questions/' + question.key + '/responses'}>{question.prompt.replace(/(<([^>]+)>)/ig, "").replace(/&nbsp;/ig, "")}</Link></li>)
    })
    return (
      <ul>{listItems}</ul>
    )
  }

  submit () {
    if (this.state.prompt !== '') {
      this.props.dispatch(questionActions.submitNewQuestion({
        prompt: this.state.prompt,
        concept_uid: this.state.concept_uid,
        instructions: this.state.instructions,
        flag: this.state.flag,
        rule_description: this.state.rule_description,
        answers: this.state.answers
      })
    }
  }

  handlePromptChange (e) {
    this.setState({prompt: e})
  }

  handleInstructionsChange(e) {
    this.setState({instructions: e.target.value})
  }

  handleRuleDescriptionChange(e) {
    this.setState({rule_description: e})
  }

  handleSelectorChange(e) {
    this.setState({concept_uid: e.value})
  }

  handleConceptChange() {
    this.setState({concept_uid: this.refs.concept.value})
  }

  handleFlagChange(e) {
    this.setState({ flag: e.target.value, });
  }

  handleAnswersChange(e) {
    this.setState({ answers: [{ text: e.target.value }], });
  }

  render () {
    const {data} = this.props.concepts, {conceptID} = this.props.match.params;
    if(this.props.concepts.hasreceiveddata && this.getConcept()) {
      return (
        <div>
          <Link to ={'/admin/concepts'}>Return to All Concepts</Link>
          <h4 className="title">{this.getConcept().displayName}</h4>
          <h6 className="subtitle">{this.questionsForConcept().length} Questions</h6>
          <div className="box">
            <h6 className="control subtitle">Create a new question</h6>
            <label className="label">Prompt</label>
            <TextEditor
              handleTextChange={this.handlePromptChange}
              EditorState={EditorState}
              ContentState={ContentState}
            />
            <label className="label">Instructions for student</label>
            <p className="control">
              <textarea className="input" type="text" ref="instructions" onChange={this.handleInstructionsChange}></textarea>
            </p>
            <FlagDropdown flag={this.state.flag} handleFlagChange={this.handleFlagChange} isLessons={false}/>
            <label className="label">Rule description</label>
            <p className="control">
              <TextEditor
                handleTextChange={this.handleRuleDescriptionChange}
                EditorState={EditorState}
                ContentState={ContentState}
              />
            </p>
            <label className="label">Optimal answer (you can add more later)</label>
            <p className="control">
              <textarea className="input" type="text" ref="answers" onChange={this.handleAnswersChange}></textarea>
            </p>
            <br/>
            <button className="button is-primary" onClick={this.submit}>Create Question</button>
          </div>
          {this.renderQuestionsForConcept()}
        </div>
      )
    } else {
      return (<div>Loading...</div>)
    }
  }
}

function select(state) {
  return {
    concepts: state.concepts,
    routing: state.routing,
    questions: state.questions
  }
}

export default connect(select)(Concept)
