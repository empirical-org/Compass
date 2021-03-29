class AddFlagsToActivities < ActiveRecord::Migration
  def change
    add_column :activities, :flags, :string, array: true, default: [], null: false
  end
end
