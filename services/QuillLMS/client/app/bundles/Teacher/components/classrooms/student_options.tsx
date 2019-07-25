import * as React from 'react'
import { Card } from 'quill-component-library/dist/componentLibrary'
import { studentsCreate, teacherCreates } from './add_students'

const studentAccountsSrc = `${process.env.CDN_URL}/images/illustrations/student-accounts.svg`
const joinLinkSrc = `${process.env.CDN_URL}/images/illustrations/join-link.svg`

interface StudentOptionsProps {
  back?: (event) => void;
  next: (event) => void;
  setStudentOption: Function;
}

export default class StudentOptions extends React.Component<StudentOptionsProps> {

  renderBody() {
    return <div className="create-a-class-modal-body modal-body">
      <h3 className="title">How do you want to add your students?</h3>
      <div className="quill-cards">
        <Card
          imgSrc={joinLinkSrc}
          header="Students create their own accounts"
          text="Get a unique link that students can use to create accounts and join your class."
          onClick={() => { this.props.setStudentOption(studentsCreate) } }
        />
        <Card
          imgSrc={studentAccountsSrc}
          header="Create accounts for students"
          text="Create accounts by inputting each student name. You'll get downloadable login information to share with your students."
          onClick={() => { this.props.setStudentOption(teacherCreates) } }
        />
      </div>
    </div>
  }

  renderFooter() {
    const { back, next, } = this.props
    if (back) {
      return <div className="create-a-class-modal-footer with-back-button">
        <button className="quill-button secondary outlined medium" onClick={back}>Back</button>
        <button className="quill-button secondary outlined medium" onClick={next}>Skip</button>
      </div>
    } else {
      return <div className="create-a-class-modal-footer">
        <button className="quill-button secondary outlined medium" onClick={next}>Skip</button>
      </div>
    }
  }

  render() {
    return (
      <div className="create-a-class-modal-content">
        {this.renderBody()}
        {this.renderFooter()}
      </div>
    )
  }
}
