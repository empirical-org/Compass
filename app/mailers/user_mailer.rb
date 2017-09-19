class UserMailer < ActionMailer::Base
  default from: 'hello@quill.org'

  def welcome_email user
    @user = user
    mail to: user.email, subject: 'Welcome to Quill!'
  end

  def password_reset_email user
    @user = user
    mail to: user.email, subject: 'Reset your Quill password'
  end

  def account_created_email(user, temp_password, admin_name)
    @user = user
    @temp_password = temp_password
    @admin_name = admin_name
    mail to: user.email, subject: 'Welcome to Quill, An Administrator Created A Quill Account For You!'
  end

  def join_school_email(user, school)
    @user = user
    @school = school
    mail to: user.email, subject: "#{user.first_name}, you need to link your account to your school"
  end

end
