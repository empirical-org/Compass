import * as React from 'react'

import { DropdownInput } from 'quill-component-library/dist/componentLibrary'

import { requestPost } from '../../../../modules/request/index.js';

const smallWhiteCheckSrc = `${process.env.CDN_URL}/images/shared/check-small-white.svg`
const swapVerticalSrc = `${process.env.CDN_URL}/images/icons/swap-vertical.svg`

interface MergeStudentAccountsModalProps {
  close: () => void;
  onSuccess: (string) => void;
  selectedStudentIds: any;
  classroom: any;
}

interface MergeStudentAccountsModalState {
  primaryAccountId: string;
  secondaryAccountId: string;
  checkboxOne: boolean;
  checkboxTwo: boolean;
  checkboxThree: boolean;
}

export default class MergeStudentAccountsModal extends React.Component<MergeStudentAccountsModalProps, MergeStudentAccountsModalState> {
  constructor(props) {
    super(props)

    this.state = {
      primaryAccountId: props.selectedStudentIds[0],
      secondaryAccountId: props.selectedStudentIds[1],
      checkboxOne: false,
      checkboxTwo: false,
      checkboxThree: false
    }

    this.handlePrimaryAccountIdChange = this.handlePrimaryAccountIdChange.bind(this)
    this.handleSecondaryAccountIdChange = this.handleSecondaryAccountIdChange.bind(this)
    this.toggleCheckbox = this.toggleCheckbox.bind(this)
    this.swapAccounts = this.swapAccounts.bind(this)
    this.mergeStudentAccounts = this.mergeStudentAccounts.bind(this)
  }

  studentOptions() {
    const { students } = this.props.classroom
    return students.map(student => {
      const completedActivityCount = student.number_of_completed_activities
      const label = `${student.name} (${completedActivityCount} ${completedActivityCount === 1 ? 'activity' : 'activities'})`
      return {
        label,
        value: student.id
      }
    })
  }

  handlePrimaryAccountIdChange(option) {
    this.setState({ primaryAccountId: option.value })
  }

  handleSecondaryAccountIdChange(option) {
    this.setState({ secondaryAccountId: option.value })
  }

  swapAccounts() {
    const { primaryAccountId, secondaryAccountId } = this.state
    this.setState({ primaryAccountId: secondaryAccountId, secondaryAccountId: primaryAccountId })
  }

  mergeStudentAccounts() {
    const { onSuccess, close, classroom, } = this.props
    const { primaryAccountId, secondaryAccountId, } = this.state
    requestPost(`/teachers/classrooms/${classroom.id}/students/merge_student_accounts`, { primary_account_id: primaryAccountId, secondary_account_id: secondaryAccountId, }, (body) => {
      onSuccess('Students merged')
      close()
    })
  }

  submitButtonClass() {
    const { primaryAccountId, secondaryAccountId, checkboxOne, checkboxTwo, checkboxThree } = this.state
    let buttonClass = 'quill-button contained primary medium';
    if (!(primaryAccountId && secondaryAccountId && checkboxOne && checkboxTwo && checkboxThree)) {
      buttonClass += ' disabled';
    }
    return buttonClass;
  }

  toggleCheckbox(checkboxNumber: 'checkboxOne'|'checkboxTwo'|'checkboxThree') {
    this.setState({ [checkboxNumber]: !this.state[checkboxNumber], })
  }

  renderCheckbox(checkboxNumber: 'checkboxOne'|'checkboxTwo'|'checkboxThree') {
    const checkbox = this.state[checkboxNumber]
    if (checkbox) {
      return <div className="quill-checkbox selected" onClick={() => this.toggleCheckbox(checkboxNumber)}><img src={smallWhiteCheckSrc} alt="check" /></div>
    } else {
      return <div className="quill-checkbox unselected" onClick={() => this.toggleCheckbox(checkboxNumber)} />
    }
  }

  renderCheckboxes() {
    return (<div className="checkboxes">
      <div className="checkbox-row">
        {this.renderCheckbox('checkboxOne')}
        <span>I understand that all data from the account to merge will be transferred to the primary account.</span>
      </div>
      <div className="checkbox-row">
        {this.renderCheckbox('checkboxTwo')}
        <span>I understand that the account to merge will be removed from the class roster.</span>
      </div>
      <div className="checkbox-row">
        {this.renderCheckbox('checkboxThree')}
        <span>I understand that this action cannot be undone.</span>
      </div>
    </div>)
  }

  render() {
    const { primaryAccountId, secondaryAccountId } = this.state
    const studentOptions = this.studentOptions()
    const studentOptionsForPrimary = studentOptions.filter(opt => opt.value !== secondaryAccountId)
    const studentOptionsForSecondary = studentOptions.filter(opt => opt.value !== primaryAccountId)
    return <div className="modal-container merge-student-accounts-modal-container">
      <div className="modal-background" />
      <div className="merge-student-accounts-modal modal modal-body">
        <div>
          <h3 className="title">Merge student accounts</h3>
        </div>
        <p>Please select the account that you'd like the student to use going forward as the primary account.</p>
        <div className="swap" onClick={this.swapAccounts}>
          <img src={swapVerticalSrc} />
          <span>Swap accounts</span>
        </div>
        <DropdownInput
          label="Select primary account"
          value={studentOptions.find(so => so.value === primaryAccountId)}
          options={studentOptionsForPrimary}
          handleChange={this.handlePrimaryAccountIdChange}
          className="primary-account"
        />
        <DropdownInput
          label="Select secondary account"
          value={studentOptions.find(so => so.value === secondaryAccountId)}
          options={studentOptionsForSecondary}
          handleChange={this.handleSecondaryAccountIdChange}
          className="secondary-account"
        />
        {this.renderCheckboxes()}
        <div className="form-buttons">
          <button className="quill-button outlined secondary medium" onClick={this.props.close}>Cancel</button>
          <button className={this.submitButtonClass()} onClick={this.mergeStudentAccounts}>Merge accounts</button>
        </div>
      </div>
    </div>
  }
}
