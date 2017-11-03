FactoryBot.define do
  factory :activity_session do
    classroom_activity  { FactoryBot.create(:classroom_activity) }
    activity            { FactoryBot.create(:activity) }
    user                { FactoryBot.create(:user) }
    uid                 { SecureRandom.urlsafe_base64  } # mock a uid
    percentage          { Faker::Number.decimal(0, 2) }
    started_at          { created_at }
    state 'started'
    temporary false
    is_retry false

    trait :finished do
      state 'finished'
      completed_at Faker::Time.backward(365) # random time in past year
      is_final_score true
    end

    trait :retry do
      is_retry true
    end
  end
end
