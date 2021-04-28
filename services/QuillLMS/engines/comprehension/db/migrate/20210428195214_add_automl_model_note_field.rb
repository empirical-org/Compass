class AddAutomlModelNoteField < ActiveRecord::Migration
  def change
    add_column :comprehension_automl_models, :note, :string
  end
end
