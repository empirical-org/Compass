/* This file contains all valid, trackable events
 * Any metrics tools we use are expected to validate any
 * event tracking requests against this list to ensure that
 * no events not in this list are allowed through
 *
 * Currently based on the list here: https://docs.google.com/spreadsheets/d/1IaZv8XVqgNbhwe31vUGMlAYFldKONutjT4ITXc9ntvw/edit?pli=1#gid=0
 */

const Events = [
  'Anonymous.ForgotPassword.RequestReset.SubmitEmail',
  'Anonymous.ForgotPassword.ResetPassword.SubmitSaveNewPassword',
  'Anonymous.NewAccount.NewStudent.ClickLogin',
  'Anonymous.NewAccount.NewStudent.ClickSignUpAsTeacher',
  'Anonymous.NewAccount.NewStudent.ClickSignUpWithClever',
  'Anonymous.NewAccount.NewStudent.ClickSignUpWithGoogle',
  'Anonymous.NewAccount.NewStudent.SubmitSignUpForm',
  'Anonymous.NewAccount.NewTeacher.ClickLogIn',
  'Anonymous.NewAccount.NewTeacher.ClickNewsletterOptIn',
  'Anonymous.NewAccount.NewTeacher.ClickNewsletterOptOut',
  'Anonymous.NewAccount.NewTeacher.ClickSignUpAsStudent',
  'Anonymous.NewAccount.NewTeacher.ClickSignUpWithClever',
  'Anonymous.NewAccount.NewTeacher.ClickSignUpWithGoogle',
  'Anonymous.NewAccount.NewTeacher.SubmitSignUpForm',
  'Anonymous.NewAccount.SelectUserType.ClickLogIn',
  'Anonymous.NewAccount.SelectUserType.ClickStudent',
  'Anonymous.NewAccount.SelectUserType.ClickTeacher',
  'Anonymous.NewSession.Login.ClickLogInWithGoogle',
  'Anonymous.NewSession.Login.ClickLogInWithClever',
  'Anonymous.NewSession.Login.ClickForgotPassword',
  'Anonymous.NewSession.Login.ClickShowPassword',
  'Anonymous.NewSession.Login.ClickHidePassword',
  'Anonymous.NewSession.Login.SubmitLogIn',
  'Anonymous.NewSession.Login.ClickSignUp',
  'Student.JoinClass.EnterClassCode.ClickJoinClass',
  'Teacher.SelectSchool.SelectK12.ClickNonK12',
  'Teacher.SelectSchool.SelectK12.ClickSkipSelection',
  'Teacher.SelectSchool.SelectK12.SelectSchool',
  'Teacher.SelectSchool.SelectNonK12.ClickHomeSchool',
  'Teacher.SelectSchool.SelectNonK12.ClickInternational',
  'Teacher.SelectSchool.SelectNonK12.ClickUSHigherEducation',
  'Teacher.SelectSchool.SelectNonK12.ClickOther',
];

export default Events;
