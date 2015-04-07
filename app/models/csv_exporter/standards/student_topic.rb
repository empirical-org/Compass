module CsvExporter::Standards
  class StudentTopic
    def header_row
      [
        'Standard Level',
        'Standard Name',
        'Activities',
        'Average Mastery Status'
      ]
    end

    def data_row(record)
      json_hash = ProgressReports::Standards::TopicSerializer.new(record).as_json(root: false)
      [
        json_hash[:section_name],
        json_hash[:name],
        json_hash[:total_activity_count],
        json_hash[:mastery_status]
      ]
    end

    def model_data(teacher, filters)
      ::Topic.for_standards_report(
        teacher,
        HashWithIndifferentAccess.new(filters) || {})
    end
  end
end