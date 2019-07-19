import * as React from 'react'
import moment from 'moment'

import { DropdownInput } from 'quill-component-library/dist/componentLibrary'
import { DataTable } from './dataTable'

const emptyDeskSrc = `${process.env.CDN_URL}/images/illustrations/empty-desks.svg`
const expandSrc = `${process.env.CDN_URL}/images/icons/expand.svg`

import NumberSuffix from '../modules/numberSuffixBuilder.js';

interface ClassroomProps {
  user: any;
  classroom: any;
  selected: boolean;
  clickClassroomHeader: (event) => void;
}

export default class Classroom extends React.Component<ClassroomProps, any> {
  constructor(props) {
    super(props)
  }

  renderClassCodeOrType() {
    const { classroom } = this.props
    if (classroom.google_id) {
      return 'Google Classroom'
    } else if (classroom.clever_id) {
      return 'Clever Classroom'
    } else {
      return `Class code: ${classroom.code}`
    }
  }

  renderGrade() {
    const { classroom } = this.props
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].includes(classroom.grade)) {
      return `${NumberSuffix(classroom.grade)} grade`
    } else {
      return classroom.grade || 'Other'
    }
  }

  renderClassroomData() {
    const { classroom } = this.props
    const numberOfStudents = classroom.students.length
    const numberOfTeachers = classroom.teachers.length
    const createdAt = moment(classroom.created_at).format('MMM D, YYYY')
    const updatedAt = moment(classroom.updated_at).format('MMM D, YYYY')
    const archivedDate = classroom.visible ? null : [<span>•</span>, <span>Archived {updatedAt}</span>]
    const coteachers = numberOfTeachers > 1 ? [<span>{numberOfTeachers - 1} {numberOfTeachers === 2 ? 'co-teacher' : 'co-teachers'}</span>, <span>•</span>] : null

    return <div className="classroom-data">
      <span>{numberOfStudents} {numberOfStudents === 1 ? 'student' : 'students'}</span>
      <span>•</span>
      {coteachers}
      <span>{this.renderClassCodeOrType()}</span>
      <span>•</span>
      <span>{this.renderGrade()}</span>
      <span>•</span>
      <span>Created {createdAt}</span>
      {archivedDate}
    </div>
  }

  renderClassroomHeader() {
    const { classroom, clickClassroomHeader } = this.props
    return <div className="classroom-card-header" onClick={() => clickClassroomHeader(classroom.id)}>
      <div className="classroom-info">
        <h2 className="classroom-name">{classroom.name}</h2>
        {this.renderClassroomData()}
      </div>
      <img className="expand-arrow" src={expandSrc} />
    </div>
  }

  renderClassSettings() {
    const { user, classroom } = this.props
    let coteacherNote
    let settings = [
      <button className="quill-button secondary outlined small">Rename class</button>,
      <button className="quill-button secondary outlined small">Change grade</button>,
      <button className="quill-button secondary outlined small">Archive</button>
    ]
    const teacher = classroom.teachers.find(t => t.id === user.id)
    if (teacher.classroom_role === 'co-teacher') {
      const owner = classroom.teachers.find(t => t.classroom_role === 'owner')
      coteacherNote = <span>Looking for more class settings? Ask {owner.name}, the class owner.</span>
      settings = [<button className="quill-button secondary outlined small">Leave class</button>]
    } else if (!classroom.visible) {
      settings = [
        <button className="quill-button secondary outlined small">Un-archive</button>
      ]
    }
    return <div className="class-settings">
      <h3>Class settings</h3>
      {coteacherNote}
      <div className="class-settings-buttons">
        {settings}
      </div>
    </div>
  }

  renderStudentActionsAndDataTable() {
    const { classroom, } = this.props
    const headers = [
      {
        width: '190px',
        name: 'Name',
        attribute: 'name'
      }, {
        width: '362px',
        name: 'Username',
        attribute: 'username'
      }, {
        width: '124px',
        name: 'Synced',
        attribute: 'synced'
      }
    ]

    const actions = [
      {
        name: 'Edit account',
        action: (id) => console.log('Edit account', id)
      },
      {
        name: 'Reset password',
        action: (id) => console.log('Reset password', id)
      },
      {
        name: 'Merge accounts',
        action: (id) => console.log('Merge accounts', id)
      },
      {
        name: 'Move class',
        action: (id) => console.log('Move class', id)
      },
      {
        name: 'Remove from class',
        action: (id) => console.log('Remove from class', id)
      }
    ]

    const rows = classroom.students.map(student => {
      const { name, username, id } = student
      let synced = ''
      if (student.google_id) { synced = 'Google Classroom'}
      if (student.clever_id) { synced = 'Clever' }
      return {
        synced,
        name,
        id,
        username,
        actions
      }
    })

    return <DataTable
      headers={headers}
      rows={rows}
      showCheckboxes={true}
      showActions={true}
      checkRow={()=>{}}
      uncheckRow={()=>{}}
      uncheckAllRows={()=>{}}
      checkAllRows={()=>{}}
    />
  }

  renderStudentSection() {
    const { classroom, } = this.props
    if (classroom.students.length) {
      return <div className="students-section">
        <div className="students-section-header with-students">
          <h3>Students</h3>
          <div className="students-section-header-buttons">
            <a href={`/teachers/classrooms/${this.props.classroom.id}/student_logins`} className="quill-button secondary outlined small">Download setup instructions</a>
            <button className="quill-button primary outlined small">Invite students</button>
          </div>
        </div>
        {this.renderStudentActionsAndDataTable()}
      </div>
    }
    else {
      return <div className="students-section">
        <div className="students-section-header">
          <h3>Students</h3>
          <button className="quill-button primary outlined small">Invite students</button>
        </div>
        <div className="no-students">
          <img src={emptyDeskSrc} />
          <p>Click on the "Invite students" button to get started with your writing instruction!</p>
        </div>
      </div>
    }
  }

  renderTeacherSection() {
    return <div className="teacher-section">
      <div className="teacher-section-header">
        <h3>Teachers</h3>
        <button className="quill-button primary outlined small">Invite co-teachers</button>
      </div>
      {this.renderTeachers()}
    </div>
  }

  renderTeachers() {

  }

  renderClassroomContent() {
    return <div>
      {this.renderClassSettings()}
      {this.renderStudentSection()}
      {this.renderTeacherSection()}
    </div>
  }

  renderClassroom() {
    const { selected  } = this.props
    return <div className={`classroom ${selected ? 'open' : 'closed'}`}>
      {this.renderClassroomHeader()}
      {selected ? this.renderClassroomContent() : null}
    </div>
  }

  render() {
    return this.renderClassroom()
  }
}
