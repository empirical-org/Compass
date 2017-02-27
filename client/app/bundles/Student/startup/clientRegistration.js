import ReactOnRails from 'react-on-rails';
import JoinClassApp from './JoinClassAppClient'
import AccountSettingsApp from './AccountSettingsAppClient'
import StudentProfileApp from '../../HelloWorld/startup/StudentProfileAppClient.jsx'

ReactOnRails.register({ StudentProfileApp, JoinClassApp, AccountSettingsApp});
