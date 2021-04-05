class TeacherFixController < ApplicationController
  include TeacherFixes
  before_action :staff!
  before_action :set_user, only: :archived_units

  def index
  end

  def archived_units
    if !@user
      render json: {error: 'No such user.'}
    elsif @user.role != 'teacher'
      render json: {error: 'This user is not a teacher.'}
    elsif archived_units_for_user.any?
      render json: {archived_units: archived_units_for_user}
    else
      render json: {error: 'This user has no archived units.'}
    end
  end

  def unarchive_units
    unit_ids = params['unit_ids']
    params['changed_names'].each do |id, name|
      Unit.unscoped.where(id: id).first.update_attribute('name', name)
    end
    Unit.unscoped.where(id: unit_ids).update_all(visible: true)
    classroom_units = ClassroomUnit.where(unit_id: unit_ids)
    classroom_units.update_all(visible: true)
    unit_activities = UnitActivity.where(unit_id: unit_ids)
    unit_activities.update_all(visible: true)
    ActivitySession.unscoped.where(classroom_unit_id: classroom_units.ids).update_all(visible: true)
    render json: {}, status: 200
  end

  def recover_classroom_units
    classroom = Classroom.find_by_code(params['class_code'])
    if classroom
      classroom_units = ClassroomUnit.unscoped.where(classroom_id: classroom.id)
      unit_ids = classroom_units.map(&:unit_id)
      Unit.unscoped.where(visible: false, id: unit_ids).update_all(visible: true)
      classroom_units.update_all(visible: true)
      ActivitySession.unscoped.where(classroom_unit_id: classroom_units.ids).update_all(visible: true)
      render json: {}, status: 200
    else
      render json: {error: 'No such classroom'}
    end
  end

  def recover_unit_activities
    user = User.find_by_email(params['email'])
    if user && user.role == 'teacher'
      units = Unit.where(user_id: user.id)
      units.each do |u|
        u.unit_activities.update_all(visible: true)
      end
      render json: {}, status: 200
    else
      render json: {error: "Cannot find a teacher with the email #{params['email']}."}
    end
  end

  def recover_activity_sessions
    user = User.find_by_email(params['email'])
    if user && user.role == 'teacher'
      unit = Unit.find_by(name: params['unit_name'], user_id: user.id)
      if unit
        ClassroomUnit.unscoped.where(unit_id: unit.id).each do |cu|
          activity_sessions = ActivitySession.unscoped.where(classroom_unit_id: cu.id)
          cu.update(visible: true, assigned_student_ids: activity_sessions.map(&:user_id))
          activity_sessions.update_all(visible: true)
        end
        render json: {}, status: 200
      else
        render json: {error: "The user with the email #{user.email} does not have a unit named #{params['unit_name']}"}
      end
    else
      render json: {error: "Cannot find a teacher with the email #{params['email']}."}
    end
  end

  def merge_student_accounts
    primary_account = User.find_by_username_or_email(params['account_1_identifier'])
    secondary_account = User.find_by_username_or_email(params['account_2_identifier'])
    if primary_account && secondary_account
      if primary_account.role == 'student' && secondary_account.role == 'student'
        if primary_account.merge_student_account(secondary_account)
          render json: {}, status: 200
        else
          render json: {error: "These students are not in the same classrooms."}
        end
      else
        nonstudent_account_identifier = primary_account.role == 'student' ? params['account_2_identifier'] : params['account_1_identifier']
        render json: {error: "#{nonstudent_account_identifier} is not a student."}
      end
    else
      missing_account_identifier = primary_account ? params['account_2_identifier'] : params['account_1_identifier']
      render json: {error: "We do not have an account for #{missing_account_identifier}"}
    end
  end

  def merge_teacher_accounts
    account1 = User.find_by_username_or_email(params['account_1_identifier'])
    account2 = User.find_by_username_or_email(params['account_2_identifier'])
    if account1 && account2
      if account1.role == 'teacher' && account2.role == 'teacher'
        Unit.unscoped.where(user_id: account1.id).update_all(user_id: account2.id)
        ClassroomsTeacher.where(user_id: account1.id).each do |ct|
          if ClassroomsTeacher.find_by(user_id: account2.id, classroom_id: ct.classroom_id)
            ct.destroy
          else
            ct.update(user_id: account2.id)
          end
        end
        account1.delete_dashboard_caches
        account2.delete_dashboard_caches
        render json: {}, status: 200
      else
        nonteacher_account_identifier = account1.role == 'teacher' ? params['account_2_identifier'] : params['account_1_identifier']
        render json: {error: "#{nonteacher_account_identifier} is not a teacher."}
      end
    else
      missing_account_identifier = account1 ? params['account_2_identifier'] : params['account_1_identifier']
      render json: {error: "We do not have an account for #{missing_account_identifier}"}
    end
  end

  def move_student_from_one_class_to_another
    account_identifier = params['student_identifier']
    user = User.find_by_username_or_email(account_identifier)
    if user
      if user.role == 'student'
        old_classroom = Classroom.find_by_code(params['class_code_1'])
        new_classroom = Classroom.find_by_code(params['class_code_2'])
        if old_classroom && new_classroom
          old_classroom_students_classrooms = StudentsClassrooms.find_by(student_id: user.id, classroom_id: old_classroom.id)
          if old_classroom_students_classrooms
            user.move_student_from_one_class_to_another(old_classroom, new_classroom)
            render json: {}, status: 200
          else
            render json: {error: "#{account_identifier} is not in a classroom with the code #{params['class_code_1']}."}
          end
        else
          missing_class_code = old_classroom ? params['class_code_2'] : params['class_code_1']
          render json: {error: "We cannot find a class with class code #{missing_class_code}."}
        end
      else
        render json: {error: "#{account_identifier} is not a student."}
      end
    else
      render json: {error: "We do not have an account for #{account_identifier}"}
    end
  end

  def google_unsync_account
    original_email = params['original_email']
    user = User.find_by_email(original_email)
    if user
      new_email = params['new_email']
      if new_email != ''
        user.update(email: new_email, password: params['password'], google_id: nil, signed_up_with_google: false, post_google_classroom_assignments: false)
      else
        user.update(password: params['password'], google_id: nil, signed_up_with_google: false, post_google_classroom_assignments: false)
      end
      if user.errors.any?
        render json: user.errors
      else
        render json: {}, status: 200
      end
    else
      render json: {error: "We do not have a user registered with the email #{original_email}"}
    end
  end

  def merge_two_schools
    begin
      raise 'Please specify a school ID.' if params['from_school_id'].nil? || params['to_school_id'].nil?
      TeacherFixes::merge_two_schools(params['from_school_id'], params['to_school_id'])
    rescue => e
      return render json: { error: e.message || e }
    end
    render json: {}, status: 200
  end

  def merge_two_classrooms
    begin
      classroom1 = Classroom.find_by(code: params['class_code_1'])
      classroom2 = Classroom.find_by(code: params['class_code_2'])
      raise 'The first class code is invalid' if !classroom1
      raise 'The second class code is invalid' if !classroom2
      TeacherFixes::merge_two_classrooms(classroom1.id, classroom2.id)
    rescue => e
      return render json: { error: e.message || e }
    end
    render json: {}, status: 200
  end

  def merge_activity_packs
    begin
      raise 'Please specify an activity pack ID.' if params['from_activity_pack_id'].nil? || params['to_activity_pack_id'].nil?
      unit1 = Unit.find_by(id: params['from_activity_pack_id'])
      unit2 = Unit.find_by(id: params['to_activity_pack_id'])
      raise 'The first activity pack ID is invalid.' if !unit1
      raise 'The second activity pack ID is invalid.' if !unit2
      raise 'The two activity packs must belong to the same teacher.' if unit1.user != unit2.user

      raise 'The two activity packs must be assigned to the same classroom.' if (unit1.classrooms & unit2.classrooms).empty?
      TeacherFixes::merge_two_units(unit1, unit2)
    rescue => e
      return render json: { error: e.message || e }
    end
    render json: {}, status: 200
  end

  def delete_last_activity_session
    begin
      account_identifier = params['student_identifier']
      user = User.find_by_username_or_email(account_identifier)
      activity = Activity.find_by(name: params['activity_name'])
      raise 'No such student' if !user
      raise 'No such activity' if !activity
      TeacherFixes::delete_last_activity_session(user.id, activity.id)
    rescue => e
      return render json: { error: e.message || e }
    end
    render json: {}, status: 200
  end

  private

  def set_user
    @user = User.find_by_username_or_email(params['teacher_identifier'])
  end

  def archived_units_for_user
    @archived_units ||= Unit.unscoped.where(visible: false, user_id: @user.id).map do |unit|
      unit = unit.attributes
      unit['shared_name'] = Unit.find_by(user_id: unit['user_id'], name: unit['name']).present?
      unit
    end
  end
end
