import * as React from 'react'
import moment from 'moment'

import { DropdownInput, DataTable } from '../../../Shared/index'

import EditStudentAccountModal from './edit_student_account_modal'
import ResetStudentPasswordModal from './reset_student_password_modal'
import MergeStudentAccountsModal from './merge_student_accounts_modal'
import MoveStudentsModal from './move_students_modal'
import RemoveStudentsModal from './remove_students_modal'
import ViewAsStudentModal from '../shared/view_as_student_modal'

const emptyDeskSrc = `${process.env.CDN_URL}/images/illustrations/empty-desks.svg`
const bulbSrc = `${process.env.CDN_URL}/images/illustrations/bulb.svg`
const cleverSetupInstructionsPdf = `${process.env.CDN_URL}/documents/setup_instructions_pdfs/clever_setup_instructions.pdf`
const googleSetupInstructionsPdf = `${process.env.CDN_URL}/documents/setup_instructions_pdfs/google_setup_instructions.pdf`

const activeHeaders = [
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

const archivedHeaders = [
  {
    width: '235px',
    name: 'Name',
    attribute: 'name'
  }, {
    width: '407px',
    name: 'Username',
    attribute: 'username'
  }, {
    width: '124px',
    name: 'Synced',
    attribute: 'synced'
  }
]

enum modalNames {
  editStudentAccountModal = 'editStudentAccountModal',
  resetStudentPasswordModal = 'resetStudentPasswordModal',
  mergeStudentAccountsModal = 'mergeStudentAccountsModal',
  moveStudentsModal = 'moveStudentsModal',
  removeStudentsModal = 'removeStudentsModal',
  viewAsStudentModal = 'viewAsStudentModal'
}

interface ClassroomStudentSectionProps {
  user: any;
  classroom: any;
  classrooms: Array<any>;
  isOwnedByCurrentUser: boolean;
  onSuccess: (event) => void;
  inviteStudents?: (event) => void;
  importGoogleClassroomStudents?: (event) => void;
}

interface ClassroomStudentSectionState {
  selectedStudentIds: Array<string|number>;
  studentIdsForModal: Array<string|number>;
  showModal?: modalNames.editStudentAccountModal|modalNames.resetStudentPasswordModal|modalNames.mergeStudentAccountsModal|modalNames.moveStudentsModal|modalNames.removeStudentsModal|modalNames.viewAsStudentModal;
}

export default class ClassroomStudentSection extends React.Component<ClassroomStudentSectionProps, ClassroomStudentSectionState> {
  constructor(props: ClassroomStudentSectionProps) {
    super(props)

    this.state = {
      selectedStudentIds: [],
      studentIdsForModal: []
    }
  }

  allGoogleStudents = () => {
    const { classroom } = this.props
    return classroom.students.every(student => student.google_id)
  }

  allCleverStudents = () => {
    const { classroom } = this.props
    return classroom.students.every(student => student.clever_id)
  }

  individualStudentActions = () => {
    return {
      editAccount: {
        name: 'Edit account',
        action: (id) => this.editStudentAccount(id)
      },
      resetPassword: {
        name: 'Reset password',
        action: (id) => this.resetStudentPassword(id)
      },
      mergeAccounts: {
        name: 'Merge accounts',
        action: (id) => this.mergeStudentAccounts(id)
      },
      moveClass: {
        name: 'Move class',
        action: (id) => this.moveClass(id)
      },
      removeFromClass: {
        name: 'Remove from class',
        action: (id) => this.removeStudentFromClass(id)
      },
      viewAsStudent: {
        name: 'View as student',
        action: (id) => this.viewAsStudent(id)
      }
    }
  }

  dropdownActions = () => {
    return {
      editAccount: {
        label: 'Edit account',
        value: this.editStudentAccount
      },
      resetPassword: {
        label: 'Reset password',
        value: this.resetStudentPassword
      },
      mergeAccounts: {
        label: 'Merge accounts',
        value: this.mergeStudentAccounts
      },
      moveClass: {
        label: 'Move class',
        value: this.moveClass
      },
      removeFromClass: {
        label: 'Remove from class',
        value: this.removeStudentFromClass
      },
      viewAsStudent: {
        label: 'View as student',
        value: this.viewAsStudent
      }
    }
  }

  actionsForIndividualStudent = (student) => {
    const { google_id, clever_id, } = student
    const { classrooms, isOwnedByCurrentUser, } = this.props
    const {
      editAccount,
      resetPassword,
      viewAsStudent,
      mergeAccounts,
      moveClass,
      removeFromClass
    } = this.individualStudentActions()
    if (google_id || clever_id) {
      return [ viewAsStudent, removeFromClass ]
    } else if (classrooms.length > 1 && isOwnedByCurrentUser) {
      return [ editAccount, resetPassword, viewAsStudent, mergeAccounts, moveClass, removeFromClass ]
    } else if (isOwnedByCurrentUser) {
      return [ editAccount, resetPassword, viewAsStudent, mergeAccounts, removeFromClass ]
    } else {
      return [ editAccount, resetPassword, viewAsStudent, removeFromClass ]
    }
  }

  checkRow = (id) => {
    const { selectedStudentIds } = this.state
    const newSelectedStudentIds = selectedStudentIds.concat(id)
    this.setState({ selectedStudentIds: newSelectedStudentIds })
  }

  uncheckRow = (id) => {
    const { selectedStudentIds } = this.state
    const newSelectedStudentIds = selectedStudentIds.filter(selectedId => selectedId !== id)
    this.setState({ selectedStudentIds: newSelectedStudentIds })
  }

  checkAllRows = () => {
    const { classroom } = this.props
    const selectedStudentIds = classroom.students.map(student => student.id)
    this.setState({ selectedStudentIds })
  }

  uncheckAllRows = () => {
    this.setState({ selectedStudentIds: [] })
  }

  handleClickViewAsStudentButton = () => this.viewAsStudent()

  onClickViewAsIndividualStudent = (id: string|number) => this.viewAsStudent(id)

  selectAction = (action) => {
    action.value()
  }

  editStudentAccount = (id=null) => {
    const { selectedStudentIds } = this.state
    // we will only show the edit student account dropdown option when only one student is selected
    const studentId = id || selectedStudentIds[0]
    this.setState( { showModal: modalNames.editStudentAccountModal, studentIdsForModal: [studentId] })
  }

  resetStudentPassword = (id=null) => {
    const { selectedStudentIds } = this.state
    // we will only show the reset password account dropdown option when only one student is selected
    const studentId = id || selectedStudentIds[0]
    this.setState( { showModal: modalNames.resetStudentPasswordModal, studentIdsForModal: [studentId] })
  }

  mergeStudentAccounts = (id=null) => {
    const { selectedStudentIds } = this.state
    // we will only show the merge student accounts account dropdown option when one or two students are selected
    const studentIds = id ? [id] : selectedStudentIds
    this.setState( { showModal: modalNames.mergeStudentAccountsModal, studentIdsForModal: studentIds })
  }

  moveClass = (id=null) => {
    const { selectedStudentIds } = this.state
    // we will show the move class dropdown option when any number of students are selected
    const studentIds = id ? [id] : selectedStudentIds
    this.setState( { showModal: modalNames.moveStudentsModal, studentIdsForModal: studentIds })
  }

  removeStudentFromClass = (id=null) => {
    const { selectedStudentIds } = this.state
    // we will show the remove student from class dropdown option when any number of students are selected
    const studentIds = id ? [id] : selectedStudentIds
    this.setState( { showModal: modalNames.removeStudentsModal, studentIdsForModal: studentIds })
  }

  viewAsStudent = (id=null) => {
    if (id) {
      window.location.href = `/teachers/preview_as_student/${id}`
    } else {
      this.setState({ showModal: modalNames.viewAsStudentModal })
    }
  }

  closeModal = () => {
    this.setState({ showModal: null, studentIdsForModal: []})
  }

  renderEditStudentAccountModal = () => {
    const { classroom, onSuccess } = this.props
    const { showModal, studentIdsForModal } = this.state
    if (showModal === modalNames.editStudentAccountModal && studentIdsForModal.length === 1) {
      const student = classroom.students.find(s => s.id === studentIdsForModal[0])
      return (<EditStudentAccountModal
        classroom={classroom}
        close={this.closeModal}
        onSuccess={onSuccess}
        student={student}
      />)
    }
  }

  renderResetStudentPasswordModal = () => {
    const { classroom, onSuccess } = this.props
    const { showModal, studentIdsForModal } = this.state
    if (showModal === modalNames.resetStudentPasswordModal && studentIdsForModal.length === 1) {
      const student = classroom.students.find(s => s.id === studentIdsForModal[0])
      return (<ResetStudentPasswordModal
        classroom={classroom}
        close={this.closeModal}
        onSuccess={onSuccess}
        student={student}
      />)
    }
  }

  renderMergeStudentAccountsModal = () => {
    const { classroom, onSuccess } = this.props
    const { showModal, studentIdsForModal } = this.state
    if (showModal === modalNames.mergeStudentAccountsModal) {
      return (<MergeStudentAccountsModal
        classroom={classroom}
        close={this.closeModal}
        onSuccess={onSuccess}
        selectedStudentIds={studentIdsForModal}
      />)
    }
  }

  renderMoveStudentsModal = () => {
    const { classroom, onSuccess, classrooms, } = this.props
    const { showModal, studentIdsForModal } = this.state
    if (showModal === modalNames.moveStudentsModal) {
      return (<MoveStudentsModal
        classroom={classroom}
        classrooms={classrooms}
        close={this.closeModal}
        onSuccess={onSuccess}
        selectedStudentIds={studentIdsForModal}
      />)
    }
  }

  renderRemoveStudentsModal = () => {
    const { classroom, onSuccess, } = this.props
    const { showModal, studentIdsForModal } = this.state
    if (showModal === modalNames.removeStudentsModal) {
      return (<RemoveStudentsModal
        classroom={classroom}
        close={this.closeModal}
        onSuccess={onSuccess}
        selectedStudentIds={studentIdsForModal}
      />)
    }
  }

  renderViewAsStudentModal = () => {
    const { classroom, classrooms, } = this.props
    const { showModal, } = this.state
    if (showModal === modalNames.viewAsStudentModal) {
      return (<ViewAsStudentModal
        classrooms={classrooms}
        close={this.closeModal}
        defaultClassroomId={classroom.id}
        handleViewClick={this.onClickViewAsIndividualStudent}
      />)
    }
  }

  optionsForStudentActions = () => {
    const { classrooms, isOwnedByCurrentUser, classroom, } = this.props
    const { selectedStudentIds } = this.state

    const anySelectedStudentsAreGoogleOrClever = selectedStudentIds.some(id => {
      const student = classroom.students.find(s => s.id === id)
      return student.google_id || student.clever_id
    })

    const {
      editAccount,
      resetPassword,
      mergeAccounts,
      moveClass,
      removeFromClass,
      viewAsStudent
    } = this.dropdownActions()

    if (anySelectedStudentsAreGoogleOrClever) {
      return [ viewAsStudent, removeFromClass ]
    } else if (classrooms.length > 1 && isOwnedByCurrentUser) {
      if (selectedStudentIds.length === 1) {
        return [ editAccount, resetPassword, viewAsStudent, mergeAccounts, moveClass, removeFromClass ]
      } else if (selectedStudentIds.length === 2) {
        return [ viewAsStudent, mergeAccounts, moveClass, removeFromClass ]
      } else {
        return [ viewAsStudent, moveClass, removeFromClass ]
      }
    } else if (isOwnedByCurrentUser) {
      if (selectedStudentIds.length === 1) {
        return [ editAccount, resetPassword, viewAsStudent, mergeAccounts, removeFromClass ]
      } else if (selectedStudentIds.length === 2) {
        return [ viewAsStudent, mergeAccounts, removeFromClass ]
      } else {
        return [ viewAsStudent, removeFromClass ]
      }
    } else {
      if (selectedStudentIds.length === 1) {
        return [ editAccount, resetPassword, viewAsStudent, removeFromClass ]
      } else {
        return [ viewAsStudent, removeFromClass ]
      }
    }
  }

  renderStudentActions() {
    const { classroom } = this.props
    const { selectedStudentIds } = this.state
    if (!classroom.visible) {
      return null
    } else {
      return (<DropdownInput
        className="student-actions-dropdown"
        disabled={selectedStudentIds.length === 0}
        handleChange={this.selectAction}
        label="Actions"
        options={this.optionsForStudentActions()}
      />)
    }
  }

  renderGoogleOrCleverNoteOfExplanation() {
    const { classroom } = this.props
    if (!classroom.visible) { return null }
    const allGoogleStudents = this.allGoogleStudents()
    const allCleverStudents = this.allCleverStudents()

    if (allGoogleStudents || allCleverStudents) {
      let copy
      if (allGoogleStudents) {
        copy = "Your students’ account information is linked to your Google Classroom account. Go to your Google Classroom account to edit your students."
      } else if (allCleverStudents) {
        copy = "Your students’ account information is auto-synced from your Clever account. You can modify your Quill class rosters from your Clever account."
      }
      return (<div className="google-or-clever-note-of-explanation">
        <div className="google-or-clever-note-of-explanation-text">
          <h4>Why can&#39;t I edit my students’ account information?</h4>
          <p>{copy}</p>
        </div>
        <img alt="lightbulb" src={bulbSrc} />
      </div>)
    }
  }

  renderStudentDataTable() {
    const { classroom, } = this.props
    const { selectedStudentIds, } = this.state

    const rows = classroom.students.map(student => {
      const { name, username, id, google_id, clever_id, } = student
      const checked = !!selectedStudentIds.includes(id)
      let synced = ''
      if (google_id) { synced = 'Google Classroom'}
      if (clever_id) { synced = 'Clever' }
      return {
        synced,
        name,
        id,
        username,
        checked,
        actions: classroom.visible ? this.actionsForIndividualStudent(student) : null
      }
    })

    return (<DataTable
      checkAllRows={this.checkAllRows}
      checkRow={this.checkRow}
      headers={classroom.visible ? activeHeaders : archivedHeaders}
      rows={rows}
      showActions={classroom.visible}
      showCheckboxes={classroom.visible}
      uncheckAllRows={this.uncheckAllRows}
      uncheckRow={this.uncheckRow}
    />)
  }

  renderStudentHeaderButtons() {
    const { classroom } = this.props
    const allGoogleStudents = this.allGoogleStudents()
    const allCleverStudents = this.allCleverStudents()
    if (!classroom.visible) { return null }
    let loginPdfHref = `/teachers/classrooms/${classroom.id}/student_logins`
    let download: boolean
    if (allGoogleStudents) {
      loginPdfHref = googleSetupInstructionsPdf
      download = true
    } else if (allCleverStudents) {
      loginPdfHref = cleverSetupInstructionsPdf
      download = true
    }
    /* eslint-disable react/jsx-no-target-blank */
    const loginPdfLink = <a className="quill-button secondary outlined small" download={download} href={loginPdfHref} rel="noopener noreferrer" target="_blank">Download setup instructions</a>
    /* eslint-enable react/jsx-no-target-blank */

    return (<div className="students-section-header-buttons">
      <div>
        {loginPdfLink}
        <button className="quill-button secondary outlined small" onClick={this.handleClickViewAsStudentButton} type="button">View as student</button>
      </div>
      {this.renderInviteStudents()}
    </div>)
  }

  renderInviteStudents() {
    const { classroom, inviteStudents, importGoogleClassroomStudents, } = this.props
    if (!classroom.visible || classroom.clever_id) { return null }
    if (classroom.google_classroom_id) {
      const lastUpdatedDate = moment(classroom.updated_at).format('MMM D, YYYY')
      return (<div className="invite-google-classroom-students">
        <button className="quill-button primary outlined small" onClick={importGoogleClassroomStudents} type="button">Import Google Classroom students</button>
        <span>Last imported {lastUpdatedDate}</span>
      </div>)
    } else {
      return (<div className="invite-quill-classroom-students">
        <button className="quill-button primary outlined small" onClick={inviteStudents} type="button">Invite students</button>
      </div>)
    }
  }

  renderStudentSection = () => {
    const { classroom, } = this.props
    if (classroom.students.length) {
      return (<div className="students-section">
        {this.renderEditStudentAccountModal()}
        {this.renderResetStudentPasswordModal()}
        {this.renderMergeStudentAccountsModal()}
        {this.renderMoveStudentsModal()}
        {this.renderRemoveStudentsModal()}
        {this.renderViewAsStudentModal()}
        <div className="students-section-header with-students">
          <h3>Students</h3>
          {this.renderStudentHeaderButtons()}
        </div>
        {this.renderGoogleOrCleverNoteOfExplanation()}
        {this.renderStudentActions()}
        {this.renderStudentDataTable()}
      </div>)
    } else if (classroom.visible) {
      let copy = 'Click on the "Invite students" button to get started with your writing instruction!'
      if (classroom.google_classroom_id) {
        copy = 'Click on the "Import Google Classroom students" button to get started with your writing instruction!'
      } else if (classroom.clever_id) {
        copy = 'Add students to your class in Clever and they will automatically appear here.'
      }
      return (<div className="students-section">
        <div className="students-section-header">
          <h3>Students</h3>
          {this.renderInviteStudents()}
        </div>
        <div className="no-students">
          <img alt="Three empty desks" src={emptyDeskSrc} />
          <p>{copy}</p>
        </div>
      </div>)
    } else {
      return (<div className="students-section empty">
        <div className="students-section-header">
          <h3>Students</h3>
        </div>
      </div>)
    }
  }

  render = () => {
    return this.renderStudentSection()
  }
}
