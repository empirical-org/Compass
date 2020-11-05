class Topic < ActiveRecord::Base
  validates :name, presence: true
  validates :visible, presence: true
  validates_inclusion_of :level, :in => 0..3

  has_many :activity_topics, dependent: :destroy
  has_many :activities, through: :activity_topics

  before_save :validate_parent_by_level

  def validate_parent_by_level
    # level 2s must have level 3 parent. all other levels must not have parent.
    if parent_id.present?
      return level == 2 && Topic.find(parent_id)&.level == 3
    else
      return level != 2
    end
  end
end