class School < ActiveRecord::Base
  has_and_belongs_to_many :users

  validate :lower_grade_within_bounds, :upper_grade_within_bounds,
           :lower_grade_greater_than_upper_grade

  private

  def lower_grade_within_bounds
    errors.add(:lower_grade, 'must be between 0 and 12') unless (0..12).include?(lower_grade.to_i)
  end

  def upper_grade_within_bounds
    errors.add(:upper_grade, 'must be between 0 and 12') unless (0..12).include?(upper_grade.to_i)
  end

  def lower_grade_greater_than_upper_grade
    return true unless lower_grade && upper_grade
    errors.add(:lower_grade, 'must be less than or equal to upper grade') if lower_grade.to_i > upper_grade.to_i
  end
end
