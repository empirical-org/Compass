class SalesStage < ActiveRecord::Base
  validates :sales_stage_type, uniqueness: { scope: :sales_contact }
  validates :sales_stage_type, presence: true
  validates :sales_contact, presence: true

  belongs_to :sales_contact
  belongs_to :sales_stage_type

  def name
    "#{sales_stage_type.order}. #{sales_stage_type.name}"
  end

  def description
    sales_stage_type.description
  end

  def action
    "Automatic"
  end
end
