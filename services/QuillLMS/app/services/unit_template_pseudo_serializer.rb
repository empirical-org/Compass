class UnitTemplatePseudoSerializer
  # attributes :id, :name, :time, :grades, :order_number, :number_of_standards, :activity_info, :author, :unit_template_category, :activities, :standards

  def initialize(unit_template, flag=nil)
    @unit_template = unit_template
  end

  def data
    ut = @unit_template
    {
      id: ut.id,
      name: ut.name,
      time: ut.time,
      grades: ut.grades,
      order_number: ut.order_number,
      created_at: ut.created_at.to_i,
      number_of_standards: number_of_standards,
      activity_info: ut.activity_info,
      author: author,
      unit_template_category: unit_template_category,
      activities: activities,
      type: type
    }
  end

  def number_of_standards
    standard_level_ids = []
    @unit_template.activities.each do |act|
      standard_level_ids << act.standard.standard_level_id
    end
    standard_level_ids.uniq.count
  end

  def unit_template_category
    cat = @unit_template.unit_template_category
    {
      primary_color: cat&.primary_color,
      secondary_color: cat&.secondary_color,
      name: cat&.name,
      id: cat&.id
    }
  end

  def author
    author = @unit_template.author
    {
      name: author&.name,
      avatar_url: author.avatar_url
    }
  end

  def activities
    activities = ActiveRecord::Base.connection.execute("SELECT activities.id,
        activities.name,
        activities.flags,
        activities.description,
        activity_classifications.key,
        activity_classifications.id AS activity_classification_id,
        activity_classifications.name AS activity_classification_name,
        standards.id AS standard_id,
        standards.name AS standard_name,
        standard_levels.name AS standard_level_name,
        standard_categories.id AS standard_category_id,
        standard_categories.name AS standard_category_name
      FROM activities
      INNER JOIN standards ON standards.id = activities.standard_id
      INNER JOIN standard_levels ON standards.standard_level_id = standard_levels.id
      INNER JOIN standard_categories ON standards.standard_category_id = standard_categories.id
      INNER JOIN activities_unit_templates ON activities.id = activities_unit_templates.activity_id
      INNER JOIN activity_classifications ON activities.activity_classification_id = activity_classifications.id
      INNER JOIN activity_category_activities ON activities.id = activity_category_activities.activity_id
      INNER JOIN activity_categories ON activity_categories.id = activity_category_activities.activity_category_id
      WHERE activities_unit_templates.unit_template_id = #{@unit_template.id}
      AND NOT 'archived' = ANY(activities.flags)
      ORDER BY activities_unit_templates.order_number, activity_categories.order_number, activity_category_activities.order_number").to_a
    activity_hashes = activities.map do |act|
      {
        id: act['id'],
        name: act['name'],
        description: act['description'],
        standard_level_name: act['standard_level_name'],
        standard: {
          id: act['standard_id'],
          name: act['standard_name'],
          standard_category: {
            id: act['standard_category_id'],
            name: act['standard_category_name']
          }
        },
        classification: {key: act['key'], id: act['activity_classification_id'], name: act['activity_classification_name']}
      }
    end
    activity_hashes.uniq { |a| a[:id] }
  end

  def type
    activities = @unit_template.activities
    if activities.any? { |act| act&.classification&.key == ActivityClassification::LESSONS_KEY }
      {
        name: UnitTemplate::WHOLE_CLASS_AND_INDEPENDENT_PRACTICE,
        primary_color: '#9c2bde'
      }
    elsif activities.any? { |act| act&.classification&.key == ActivityClassification::DIAGNOSTIC_KEY }
      {
        name: UnitTemplate::DIAGNOSTIC,
        primary_color: '#ea9a1a'
      }
    else
      {
        name: UnitTemplate::INDEPENDENT_PRACTICE,
        primary_color: '#348fdf'
      }
    end
  end

end
