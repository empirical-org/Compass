module NavigationHelper
  def home_page_should_be_active?
    ['dashboard', 'my_account', 'teacher_guide', 'google_sync'].include?(action_name) || (controller_name == 'subscriptions' && action_name == 'index') || controller_name == 'referrals'
  end

  def new_classes_page_should_be_active?
    controller.class == Teachers::ClassroomsController && action_name == 'new_index'
  end

  def classes_page_should_be_active?
    (controller.class == Teachers::ClassroomsController ||
    controller_name == 'students' ||
    action_name == 'invite_students') &&
    controller.class.parent != Teachers::ProgressReports::Concepts
  end

  def assign_activity_page_should_be_active?
    controller.class == Teachers::ClassroomManagerController && action_name == 'assign_activities'
  end

  def my_activities_page_should_be_active?
    controller.class == Teachers::ClassroomManagerController && action_name == 'lesson_planner'
  end

  def student_reports_page_should_be_active?
    controller.class == Teachers::ProgressReportsController ||
    controller.class.parent == Teachers::ProgressReports ||
    controller.class.parent == Teachers::ProgressReports::Standards ||
    controller.class.parent == Teachers::ProgressReports::Concepts ||
    action_name == 'scorebook'
  end

  def admin_page_should_be_active?
    action_name == 'admin_dashboard'
  end

  def premium_page_should_be_active?
    # action_name == 'premium'
  end

  def premium_tab_copy
    case current_user.premium_state
    when 'trial'
      "Premium  <i class='fa fa-star'></i> #{current_user.trial_days_remaining} Days Left"
    when 'locked'
      "Premium  <i class='fa fa-star'></i> Trial Expired"
    when nil
      "Try Premium <i class='fa fa-star'></i>"
    when 'none'
      "Try Premium <i class='fa fa-star'></i>"
    end
  end


  # NOTE: subnavs for other pages are handled on the front end with React.
  def should_render_subnav?
    home_page_should_be_active? || classes_page_should_be_active? || student_reports_page_should_be_active?
  end
end
