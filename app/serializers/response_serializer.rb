class ResponseSerializer < ActiveModel::Serializer
  attributes :id, :text, :feedback, :count, :child_count, :first_attempt_count, :concept_results, :question_uid, :parent_id
end
