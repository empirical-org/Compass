class Teachers::ProgressReports::Concepts::StudentsController < Teachers::ProgressReportsController
  def index
    respond_to do |format|
      format.html
      format.json { render json: json_payload }
    end
  end

  private

  def json_payload
    {
      students: students_as_json
    }
  end

  def students_as_json
    ::ProgressReports::Concepts::User.results(current_user, {}).map do |student|
      serializer = ::ProgressReports::Concepts::StudentSerializer.new(student)
      serializer.as_json(root: false)
    end
  end
end
