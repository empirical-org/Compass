# == Schema Information
#
# Table name: feedback_histories
#
#  id                   :integer          not null, primary key
#  activity_session_uid :text
#  attempt              :integer          not null
#  concept_uid          :text
#  entry                :text             not null
#  feedback_text        :text
#  feedback_type        :text             not null
#  metadata             :jsonb
#  optimal              :boolean          not null
#  prompt_type          :string
#  rule_uid             :string
#  time                 :datetime         not null
#  used                 :boolean          not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  prompt_id            :integer
#
# Indexes
#
#  index_feedback_histories_on_activity_session_uid  (activity_session_uid)
#  index_feedback_histories_on_concept_uid           (concept_uid)
#  index_feedback_histories_on_prompt_type_and_id    (prompt_type,prompt_id)
#  index_feedback_histories_on_rule_uid              (rule_uid)
#
require 'rails_helper'

# it { shoulda cheatsheet: https://github.com/thoughtbot/it { shoulda-matchers#activemodel-matchers
RSpec.describe FeedbackHistory, type: :model do

  context 'associations' do
    it { should belong_to(:activity_session) }
    it { should belong_to(:prompt) }
    it { should belong_to(:concept).with_foreign_key(:concept_uid).with_primary_key(:uid) }
  end

  context 'validations' do
    it { should validate_presence_of(:activity_session_uid) }

    it { should validate_presence_of(:attempt) }
    it do
       should validate_numericality_of(:attempt)
        .only_integer
        .is_greater_than_or_equal_to(1)
        .is_less_than_or_equal_to(5)
    end

    it { should validate_length_of(:concept_uid).is_equal_to(22) }

    it { should validate_presence_of(:entry) }
    it { should validate_length_of(:entry).is_at_least(5).is_at_most(500) }

    it { should validate_length_of(:feedback_text).is_at_least(10).is_at_most(500) }

    it { should validate_presence_of(:feedback_type) }
    it { should validate_inclusion_of(:feedback_type).in_array(FeedbackHistory::FEEDBACK_TYPES) }

    it { should allow_value(true).for(:optimal) }
    it { should allow_value(false).for(:optimal) }

    it { should allow_value(true).for(:used) }
    it { should allow_value(false).for(:used) }

    it { should validate_presence_of(:time) }
  end

  context 'concept results hash' do
    setup do
      @prompt = Comprehension::Prompt.create(text: 'Test test test text')
      @activity = create(:comprehension_activity)
      @activity_session = create(:activity_session, activity_id: @activity.id)
      @concept = create(:concept)
      @feedback_history = create(:feedback_history, activity_session_uid: @activity_session.uid, concept: @concept, prompt: @prompt)
    end

    it 'should fill out hash with all fields' do
      concept_results_hash = @feedback_history.concept_results_hash

      expect(concept_results_hash[:concept_uid]).to eq(@feedback_history.concept_uid)
      expect(concept_results_hash[:activity_session_id]).to eq(@feedback_history.activity_session.id)
      expect(concept_results_hash[:activity_classification_id]).to eq(7)
      expect(concept_results_hash[:concept_id]).to eq(@feedback_history.concept.id)
      expect(concept_results_hash[:metadata]).to eq({correct: 1, answer: @feedback_history.entry, feedback_type: @feedback_history.feedback_type})
    end

    it 'should return empty hash when there is no concept' do
      feedback_history = create(:feedback_history, activity_session_uid: @activity_session.uid, concept: nil, prompt: @prompt)
      concept_results_hash = feedback_history.concept_results_hash

      expect(concept_results_hash).to eq({})
    end
  end

  context 'serializable_hash' do
    setup do
      @prompt = Comprehension::Prompt.create(text: 'Test text')
      @feedback_history = create(:feedback_history, prompt: @prompt)
    end

    it 'should fill out hash with all fields' do
      json_hash = @feedback_history.as_json

      expect(json_hash['id']).to eq(@feedback_history.id)
      expect(json_hash['activity_session_uid']).to eq(@feedback_history.activity_session_uid)
      expect(json_hash['concept_uid']).to eq(@feedback_history.concept_uid)
      expect(json_hash['attempt']).to eq(@feedback_history.attempt)
      expect(json_hash['entry']).to eq(@feedback_history.entry)
      expect(json_hash['optimal']).to eq(@feedback_history.optimal)
      expect(json_hash['used']).to eq(@feedback_history.used)
      expect(json_hash['feedback_text']).to eq(@feedback_history.feedback_text)
      expect(json_hash['feedback_type']).to eq(@feedback_history.feedback_type)
      expect(json_hash['time']).to eq(@feedback_history.time)
      expect(json_hash['metadata']).to eq(@feedback_history.metadata)
      expect(json_hash['rule_uid']).to eq(@feedback_history.rule_uid)

      expect(json_hash['prompt']).to eq(@feedback_history.prompt.as_json)
      expect(json_hash['prompt']['text']).to eq(@prompt.text)
    end
  end

  context 'batch_create' do
    setup do
      @valid_fh_params = {
        activity_session_uid: SecureRandom.uuid,
        attempt: 1,
        entry: 'This is the student entry',
        feedback_text: 'This is the feedback text',
        feedback_type: 'autoML',
        optimal: false,
        time: Time.now,
        used: true
      }
      @invalid_fh_params = {}
    end

    it 'should save and return if all creations are valid' do
        expect(FeedbackHistory.count).to eq(0)
	FeedbackHistory.batch_create([@valid_fh_params, @valid_fh_params, @valid_fh_params])
	expect(FeedbackHistory.count).to eq(3)
    end

    it 'should save any valid records if, but not any valid ones' do
        expect(FeedbackHistory.count).to eq(0)
	results = FeedbackHistory.batch_create([@invalid_fh_params, @valid_fh_params])
	expect(FeedbackHistory.count).to eq(1)
        expect(results[0].errors[:entry].include?("can't be blank")).to be
        expect(results[1].valid?).to be
    end
  end

  context 'before_validation: ensure_prompt_type' do
    it 'should set default prompt_type if prompt_id is set, but prompt_type is not' do
      fh = FeedbackHistory.create(prompt_id: 1)
      expect(fh.prompt_type).to eq(FeedbackHistory::DEFAULT_PROMPT_TYPE)
    end

    it 'should not set prompt_type if there is no prompt_id' do
      fh = FeedbackHistory.create
      refute fh.prompt_type
    end

    it 'should not set prompt_type if prompt_type is provided' do
      fh = FeedbackHistory.create(prompt_id: 1, prompt_type: 'MadeUp')
      expect(fh.prompt_type).to eq('MadeUp')
    end
  end

  context 'Session-aggregate FeedbackHistories' do
    setup do
      @activity1 = Comprehension::Activity.create!(name: 'Title_1', title: 'Title 1', parent_activity_id: 1, target_level: 1)
      @activity2 = Comprehension::Activity.create!(name: 'Title_2', title: 'Title 2', parent_activity_id: 2, target_level: 1)
      @because_prompt1 = Comprehension::Prompt.create!(activity: @activity1, conjunction: 'because', text: 'Some feedback text', max_attempts_feedback: 'Feedback')
      @because_prompt2 = Comprehension::Prompt.create!(activity: @activity2, conjunction: 'because', text: 'Some feedback text', max_attempts_feedback: 'Feedback')
      @but_prompt1 = Comprehension::Prompt.create!(activity: @activity1, conjunction: 'but', text: 'Some feedback text', max_attempts_feedback: 'Feedback')
      @but_prompt2 = Comprehension::Prompt.create!(activity: @activity2, conjunction: 'but', text: 'Some feedback text', max_attempts_feedback: 'Feedback')
      @so_prompt1 = Comprehension::Prompt.create!(activity: @activity1, conjunction: 'so', text: 'Some feedback text', max_attempts_feedback: 'Feedback')
      @so_prompt2 = Comprehension::Prompt.create!(activity: @activity2, conjunction: 'so', text: 'Some feedback text', max_attempts_feedback: 'Feedback')
  
      @session1_uid = SecureRandom.uuid
      @session2_uid = SecureRandom.uuid
  
      @first_session_feedback1 = create(:feedback_history, activity_session_uid: @session1_uid, prompt_id: @because_prompt1.id, optimal: false)
      @first_session_feedback2 = create(:feedback_history, activity_session_uid: @session1_uid, prompt_id: @because_prompt1.id, attempt: 2, optimal: true)
      @first_session_feedback3 = create(:feedback_history, activity_session_uid: @session1_uid, prompt_id: @but_prompt1.id, optimal: true)
      @first_session_feedback4 = create(:feedback_history, activity_session_uid: @session1_uid, prompt_id: @so_prompt1.id, optimal: false)
      @first_session_feedback5 = create(:feedback_history, activity_session_uid: @session1_uid, prompt_id: @so_prompt1.id, attempt: 2, optimal: false)
      @first_session_feedback6 = create(:feedback_history, activity_session_uid: @session1_uid, prompt_id: @so_prompt1.id, attempt: 3, optimal: true)
      @second_session_feedback = create(:feedback_history, activity_session_uid: @session2_uid, prompt_id: @because_prompt2.id, optimal: false)
      create(:feedback_history, activity_session_uid: @session2_uid, prompt_id: @because_prompt2.id, attempt: 2, optimal: false)
    end
  
    context '#list_by_activity_session' do
      it 'should identify two records when there are two unique activity_session_uids' do
        expect(FeedbackHistory.list_by_activity_session.length).to eq(2)
      end
  
      it 'should sort newest first' do
        expect(FeedbackHistory.list_by_activity_session[0].session_uid).to eq(@session2_uid)
      end
  
      it 'should only return enough items as specified via page_size' do
        responses = FeedbackHistory.list_by_activity_session(page_size: 1)
        expect(responses.length).to eq(1)
        expect(responses[0].session_uid).to eq(@session2_uid)
      end
  
      it 'should skip pages when specified via page' do
        responses = FeedbackHistory.list_by_activity_session(page: 2, page_size: 1)
        expect(responses.length).to eq(1)
        expect(responses[0].session_uid).to eq(@session1_uid)
      end
  
      it 'should identify a session as incomplete if not all prompts have optimal feedback or too many attempts' do
        expect(FeedbackHistory.list_by_activity_session[0].complete).to eq(false)
      end
  
      it 'should identify a session as complete if all prompts have an optimal response in feedback history' do
        expect(FeedbackHistory.list_by_activity_session[1].complete).to eq(true)
      end
  
      it 'should identify a session as complete if all prompts have optimal responses or too many attempts' do
      create(:feedback_history, activity_session_uid: @session2_uid, prompt_id: @because_prompt2.id, attempt: 3, optimal: true)
        5.times {|i| create(:feedback_history, activity_session_uid: @session2_uid, prompt_id: @but_prompt2.id, attempt: i + 1, optimal: false) }
        5.times {|i| create(:feedback_history, activity_session_uid: @session2_uid, prompt_id: @so_prompt2.id, attempt: i + 1, optimal: false) }
        expect(FeedbackHistory.list_by_activity_session[0].complete).to eq(true)
      end
    end
  
    context '#serialize_list_by_activity_session' do
      it 'should take the query from #list_by_activity_session and return a shaped payload' do
        responses = FeedbackHistory.list_by_activity_session
        expect(responses.map { |r| r.serialize_by_activity_session }.to_json).to eq([
          {
            session_uid: @session2_uid,
            start_date: @second_session_feedback.time.iso8601(3),
            activity_id: @activity2.id,
            because_attempts: 2,
            but_attempts: 0,
            so_attempts: 0,
            complete: false
          }, {
            session_uid: @session1_uid,
            start_date: @first_session_feedback1.time.iso8601(3),
            activity_id: @activity1.id,
            because_attempts: 2,
            but_attempts: 1,
            so_attempts: 3,
            complete: true
          }
        ].to_json)
      end
    end
  
    context '#serialize_detail_by_activity_session' do
      it 'should build the expeted payload' do
        payload = FeedbackHistory.serialize_detail_by_activity_session(@session1_uid).symbolize_keys

        expect(payload[:start_date].to_json).to eq(@first_session_feedback1.time.to_json)
        expect(payload[:session_uid]).to eq(@first_session_feedback1.activity_session_uid)
        expect(payload[:activity_id]).to eq(@activity1.id)
        expect(payload[:complete]).to eq(true)

        expect(payload[:prompts][:because][:prompt_id]).to eq(@because_prompt1.id)
  
        expect(payload[:prompts][:because][:attempts][1][0][:used]).to eq(@first_session_feedback1.used)
        expect(payload[:prompts][:because][:attempts][1][0][:entry]).to eq(@first_session_feedback1.entry)
        expect(payload[:prompts][:because][:attempts][1][0][:feedback_text]).to eq(@first_session_feedback1.feedback_text)
        expect(payload[:prompts][:because][:attempts][1][0][:feedback_type]).to eq(@first_session_feedback1.feedback_type)
        expect(payload[:prompts][:because][:attempts][1][0][:optimal]).to eq(@first_session_feedback1.optimal)
  
        expect(payload[:prompts][:because][:attempts][2][0][:used]).to eq(@first_session_feedback2.used)
        expect(payload[:prompts][:because][:attempts][2][0][:entry]).to eq(@first_session_feedback2.entry)
        expect(payload[:prompts][:because][:attempts][2][0][:feedback_text]).to eq(@first_session_feedback2.feedback_text)
        expect(payload[:prompts][:because][:attempts][2][0][:feedback_type]).to eq(@first_session_feedback2.feedback_type)
        expect(payload[:prompts][:because][:attempts][2][0][:optimal]).to eq(@first_session_feedback2.optimal)
  
        expect(payload[:prompts][:but][:prompt_id]).to eq(@but_prompt1.id)
  
        expect(payload[:prompts][:but][:attempts][1][0][:used]).to eq(@first_session_feedback3.used)
        expect(payload[:prompts][:but][:attempts][1][0][:entry]).to eq(@first_session_feedback3.entry)
        expect(payload[:prompts][:but][:attempts][1][0][:feedback_text]).to eq(@first_session_feedback3.feedback_text)
        expect(payload[:prompts][:but][:attempts][1][0][:feedback_type]).to eq(@first_session_feedback3.feedback_type)
        expect(payload[:prompts][:but][:attempts][1][0][:optimal]).to eq(@first_session_feedback3.optimal)
  
        expect(payload[:prompts][:so][:prompt_id]).to eq(@so_prompt1.id)
  
        expect(payload[:prompts][:so][:attempts][1][0][:used]).to eq(@first_session_feedback4.used)
        expect(payload[:prompts][:so][:attempts][1][0][:entry]).to eq(@first_session_feedback4.entry)
        expect(payload[:prompts][:so][:attempts][1][0][:feedback_text]).to eq(@first_session_feedback4.feedback_text)
        expect(payload[:prompts][:so][:attempts][1][0][:feedback_type]).to eq(@first_session_feedback4.feedback_type)
        expect(payload[:prompts][:so][:attempts][1][0][:optimal]).to eq(@first_session_feedback4.optimal)
  
        expect(payload[:prompts][:so][:attempts][2][0][:used]).to eq(@first_session_feedback5.used)
        expect(payload[:prompts][:so][:attempts][2][0][:entry]).to eq(@first_session_feedback5.entry)
        expect(payload[:prompts][:so][:attempts][2][0][:feedback_text]).to eq(@first_session_feedback5.feedback_text)
        expect(payload[:prompts][:so][:attempts][2][0][:feedback_type]).to eq(@first_session_feedback5.feedback_type)
        expect(payload[:prompts][:so][:attempts][2][0][:optimal]).to eq(@first_session_feedback5.optimal)
  
        expect(payload[:prompts][:so][:attempts][3][0][:used]).to eq(@first_session_feedback6.used)
        expect(payload[:prompts][:so][:attempts][3][0][:entry]).to eq(@first_session_feedback6.entry)
        expect(payload[:prompts][:so][:attempts][3][0][:feedback_text]).to eq(@first_session_feedback6.feedback_text)
        expect(payload[:prompts][:so][:attempts][3][0][:feedback_type]).to eq(@first_session_feedback6.feedback_type)
        expect(payload[:prompts][:so][:attempts][3][0][:optimal]).to eq(@first_session_feedback6.optimal)
      end
    end
  end
end
