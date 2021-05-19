require 'rails_helper'

RSpec.describe PromptFeedbackHistory, type: :model do
  before do
    # This is for CircleCI. Note that this refresh is NOT concurrent.
    ActiveRecord::Base.refresh_materialized_view('feedback_histories_grouped_by_rule_uid', false)
  end
  
  describe '#promptwise_sessions' do 
    it 'should aggregate rows correctly' do 
      main_activity = Comprehension::Activity.create!(name: 'Title_1', title: 'Title 1', parent_activity_id: 1, target_level: 1)
      unused_activity = Comprehension::Activity.create!(name: 'Title_2', title: 'Title 2', parent_activity_id: 2, target_level: 1)

      prompt1 = Comprehension::Prompt.create!(activity: main_activity, conjunction: 'because', text: 'Some feedback text', max_attempts_feedback: 'Feedback')
      prompt2 = Comprehension::Prompt.create!(activity: main_activity, conjunction: 'because', text: 'Some feedback text', max_attempts_feedback: 'Feedback')
      prompt3 = Comprehension::Prompt.create!(activity: unused_activity, conjunction: 'because', text: 'Some feedback text', max_attempts_feedback: 'Feedback')

      session_uid1 = SecureRandom.uuid
      session_uid2 = SecureRandom.uuid
      session_uid3 = SecureRandom.uuid

      f_h1 = create(:feedback_history, attempt: 1, optimal: false, prompt_id: prompt1.id, feedback_session_uid: session_uid1)
      f_h2 = create(:feedback_history, attempt: 2, optimal: true, prompt_id: prompt1.id, feedback_session_uid: session_uid1)
      f_h3 = create(:feedback_history, attempt: 1, optimal: false, prompt_id: prompt2.id, feedback_session_uid: session_uid2)
      f_h4 = create(:feedback_history, attempt: 2, optimal: false, prompt_id: prompt2.id, feedback_session_uid: session_uid2)
      f_h4 = create(:feedback_history, prompt_id: prompt3.id, feedback_session_uid: session_uid3)

      result = PromptFeedbackHistory.promptwise_sessions(main_activity.id)

      expect(result.count).to eq 2
      expect(result.first.at_least_one_optimal).to be true 
      expect(result.first.attempt_cardinal).to eq 2
      expect(result.last.at_least_one_optimal).to be false
      expect(result.last.attempt_cardinal).to eq 2
    end

  end

  describe '#promptwise_postprocessing' do 
    it 'should format' do 
      main_activity = create(:activity)
      unused_activity = create(:activity)

      p1 = Comprehension::Prompt.create!(
        id: 1,
        activity: main_activity,
        text: 'lorem ipsum1',
        conjunction: Comprehension::Prompt::CONJUNCTIONS.first,
        max_attempts: 5
      )

      p2 = Comprehension::Prompt.create!(
        id: 2,
        activity: main_activity,
        text: 'lorem ipsum2',
        conjunction: Comprehension::Prompt::CONJUNCTIONS.first,
        max_attempts: 5
      )

      as1 = create(:activity_session, activity_id: main_activity.id)
      as2 = create(:activity_session, activity_id: main_activity.id)
      as3 = create(:activity_session, activity_id: unused_activity.id)

      f_h1 = create(:feedback_history, feedback_session_uid: as1.uid, attempt: 1, optimal: false, prompt_id: 1)
      f_h2 = create(:feedback_history, feedback_session_uid: as1.uid, attempt: 2, optimal: true, prompt_id: 1)
      f_h3 = create(:feedback_history, feedback_session_uid: as2.uid, attempt: 1, optimal: false, prompt_id: 2)
      f_h4 = create(:feedback_history, feedback_session_uid: as2.uid, attempt: 2, optimal: false, prompt_id: 2)
      f_h4 = create(:feedback_history, feedback_session_uid: as3.uid, prompt_id: 3)

      result = PromptFeedbackHistory.promptwise_sessions(main_activity.id)
      processed = PromptFeedbackHistory.promptwise_postprocessing(result)
      expect(processed == {
        1 => {
          optimal_final_attempts: 1,
          session_count: 1,
          total_responses: 2,
          final_attempt_pct_optimal: 1.0,
          final_attempt_pct_not_optimal: 0.0,
          display_name: "lorem ipsum1"
        },
        2 => {
          optimal_final_attempts: 0,
          session_count: 1,
          total_responses: 2,
          final_attempt_pct_optimal: 0.0,
          final_attempt_pct_not_optimal: 1.0,
          display_name: "lorem ipsum2"
        }
      }).to be true

    end

  end

end
