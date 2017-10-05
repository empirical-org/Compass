class AssignRecommendationsWorker
  include Sidekiq::Worker

  def perform(unit_template_id, classroom_id, student_id_array, last, lesson)
    classroom = Classroom.find(classroom_id)
    teacher = classroom.teacher
    unit = Unit.find_by(name: UnitTemplate.find(unit_template_id).name, user_id: teacher.id)
    classroom_data = {id: classroom_id, student_ids: student_id_array}
    puts 'classroom here'
    puts classroom.attributes
    puts 'unit here'
    unit
    puts 'classroom_data here'
    puts classroom_data
    if unit
        Units::Updater.assign_unit_template_to_one_class(unit.id, classroom_data, unit_template_id)
    else
        #  TODO: use a find or create for the unit var above.
        #  This way, we can just pass the units creator a unit argument.
        #  The reason we are not doing so at this time, is because the unit creator
        #  Is used elsewhere, and we do not want to overly optimize it for the diagnostic
        Units::Creator.assign_unit_template_to_one_class(teacher.id, unit_template_id, classroom_data)
    end

    analytics = AssignRecommendationsAnalytics.new
    analytics.track(teacher)

    PusherRecommendationCompleted.run(classroom, unit_template_id, lesson) if last
  end
end
