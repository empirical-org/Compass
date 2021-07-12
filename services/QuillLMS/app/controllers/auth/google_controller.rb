class Auth::GoogleController < ApplicationController
  before_action :set_profile, only: :google
  before_action :set_user, only: :google
  before_action :save_teacher_from_google_signup, only: :google
  before_action :save_student_from_google_signup, only: :google
  before_action :follow_google_redirect, only: :google
  before_action :verify_credentials, only: :google

  def google
    run_background_jobs

    sign_in(@user)

    if session[ApplicationController::POST_AUTH_REDIRECT].present?
      url = session[ApplicationController::POST_AUTH_REDIRECT]
      session.delete(ApplicationController::POST_AUTH_REDIRECT)
      redirect_to url
    else
      redirect_to profile_path
    end
  end

  private def verify_credentials
    redirect_to GoogleIntegration::AUTHORIZATION_AND_AUTHENTICATION_PATH unless @user.google_authorized?
  end

  private def run_background_jobs
    GoogleStudentImporterWorker.perform_async(@user.id, 'Auth::GoogleController') if @user.teacher?
    GoogleStudentClassroomWorker.perform_async(@user.id) if @user.student?
  end

  private def follow_google_redirect
    if session[GOOGLE_REDIRECT]
      redirect_route = session[GOOGLE_REDIRECT]
      session[GOOGLE_REDIRECT] = nil
      redirect_to redirect_route
    end
  end

  private def set_profile
    @profile = GoogleIntegration::Profile.new(request, session)
  end

  private def set_user
    if non_standard_route_redirect?(session[GOOGLE_REDIRECT])
      if current_user
        user = current_user.update(email: @profile.email)
        if user
          session[ApplicationController::GOOGLE_OR_CLEVER_JUST_SET] = true
        else
          flash[:error] = "This Google account is already associated with another Quill account. Contact support@quill.org for further assistance."
          flash.keep(:error)
        end
      else
        flash[:error] = "You are not logged in. Please try again or contact support@quill.org for further assistance."
        flash.keep(:error)
      end
    end
    @user = GoogleIntegration::User.new(@profile).update_or_initialize

    if @user.new_record? && session[:role].blank?
      flash[:error] = user_not_found_error_message
      flash.keep(:error)
      redirect_to(new_session_path, status: :see_other)
    end
  end

  private def user_not_found_error_message
    <<-HTML
      <p align='left'>
        We could not find your account. Is this your first time logging in? <a href='/account/new'>Sign up</a> here if so.
        <br/>
        If you believe this is an error, please contact <strong>support@quill.org</strong> with the following info to unblock your account:
        <i>failed login of #{@profile.email} and googleID #{@profile.google_id} at #{Time.zone.now}</i>.
      </p>
    HTML
  end

  private def save_student_from_google_signup
    return unless @user.new_record? && @user.student?

    unless @user.save
      redirect_to new_account_path
    end
  end

  private def save_teacher_from_google_signup
    return unless @user.new_record? && @user.teacher?

    @js_file = 'session'

    if @user.save
      CompleteAccountCreation.new(@user, request.remote_ip).call
      @user.subscribe_to_newsletter
      @teacher_from_google_signup = true

      sign_in(@user)
      return redirect_to '/sign-up/add-k12'
    else
      @teacher_from_google_signup = false
      flash.now[:error] = @user.errors.full_messages.join(', ')
    end

    render 'accounts/new'
  end
end
