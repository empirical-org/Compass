require 'test_helper'

module Comprehension
  class RuleTest < ActiveSupport::TestCase

    context 'validations' do
      subject { FactoryBot.build(:comprehension_rule) }
      should validate_uniqueness_of(:uid)
      should validate_presence_of(:name)
      should validate_length_of(:name).is_at_most(250)
      should validate_inclusion_of(:universal).in_array(Rule::ALLOWED_BOOLEANS)
      should validate_inclusion_of(:rule_type).in_array(Rule::TYPES)
      should validate_inclusion_of(:state).in_array(Rule::STATES)
      should validate_inclusion_of(:optimal).in_array(Rule::ALLOWED_BOOLEANS)
      should validate_numericality_of(:suborder)
        .only_integer
        .is_greater_than_or_equal_to(0)
        .allow_nil
    end

    context 'relationships' do
      should have_one(:label)
      should have_one(:plagiarism_text)
      should have_many(:feedbacks)
      should have_many(:prompts_rules)
      should have_many(:prompts).through(:prompts_rules)
      should have_many(:regex_rules).dependent(:destroy)
    end

    context 'before_validation' do
      context 'assign_uid_if_missing' do
        should 'keep existing uid if already set' do
          rule = build(:comprehension_rule)
          old_uid = rule.uid
          rule.valid?
          assert_equal old_uid, rule.uid
        end
        should 'set new uid if missing' do
          rule = build(:comprehension_rule, uid: nil)
          rule.valid?
          assert_not_nil rule.uid
        end
      end
    end

    context 'serializable_hash' do
      setup do
        @rule_prompt = create(:comprehension_prompts_rule)
        @rule = @rule_prompt.rule
        @prompt = @rule_prompt.prompt
      end

      should 'fill out hash with all fields' do
        json_hash = @rule.as_json

        assert_equal json_hash['id'], @rule.id
        assert_equal json_hash['uid'], @rule.uid
        assert_equal json_hash['name'], @rule.name
        assert_equal json_hash['note'], @rule.note
        assert_equal json_hash['universal'], @rule.universal
        assert_equal json_hash['rule_type'], @rule.rule_type
        assert_equal json_hash['optimal'], @rule.optimal
        assert_equal json_hash['suborder'], @rule.suborder
        assert_equal json_hash['concept_uid'], @rule.concept_uid
        assert_equal json_hash['prompt_ids'], @rule.prompt_ids
      end
    end


    context 'display_name' do
      should 'correspond to the correct display name' do
        rule = create(:comprehension_rule, rule_type: 'rules-based-2')
        assert rule.display_name, 'Post-Topic Regex'
      end
    end

    context '#determine_feedback_from_history' do
      setup do
        @rule = create(:comprehension_rule)
        @feedback1 = create(:comprehension_feedback, rule: @rule, order: 0, text: 'Example feedback 1')
        @feedback2 = create(:comprehension_feedback, rule: @rule, order: 1, text: 'Example feedback 2')
        @feedback3 = create(:comprehension_feedback, rule: @rule, order: 2, text: 'Example feedback 3')
      end

      should 'fetch lowest order feedback if feedback history is empty' do
        feedback_history = []

        assert_equal @rule.determine_feedback_from_history(feedback_history), @feedback1
      end

      should 'fetch lowest order feedback with text not matched from history' do
        feedback_history = [{
          "feedback" => @feedback1.text,
          "feedback_type" => @rule.rule_type
        }]

        assert_equal @rule.determine_feedback_from_history(feedback_history), @feedback2
      end

      should 'fetch highest order if all feedbacks have text matched from history' do
        feedback_history = [{
          "feedback" => @feedback1.text,
          "feedback_type" => @rule.rule_type
        },{
          "feedback" => @feedback2.text,
          "feedback_type" => @rule.rule_type
        },{
          "feedback" => @feedback3.text,
          "feedback_type" => @rule.rule_type
        }]

        assert_equal @rule.determine_feedback_from_history(feedback_history), @feedback3
      end
    end

    context 'regex_is_passing?' do
      setup do
        @rule = create(:comprehension_rule)
        @regex_rule = create(:comprehension_regex_rule, rule: @rule, regex_text: "^Hello", sequence_type: 'incorrect')
        @regex_rule_two = create(:comprehension_regex_rule, rule: @rule, regex_text: "^Something", sequence_type: 'incorrect')
      end

      should 'be true if entry does not match the regex text' do
        assert @rule.regex_is_passing?('Nope, I dont start with hello.')
      end

      should 'be true if sequence_type is incorrect and entry does not match the regex text' do
        assert @rule.regex_is_passing?('Nope, I dont start with hello.')
      end

      should 'be false if sequence_type is incorrect and entry matches the regex text and there are more than one sequences' do
        refute @rule.regex_is_passing?('Something is wrong here.')
      end

      should 'be false if sequence_type is incorrect and entry matches regex text' do
        assert !@rule.regex_is_passing?('Hello!!!')
      end

      should 'be false if sequence_type is required and entry does not match regex text' do
        required_rule = create(:comprehension_rule)
        @regex_rule_three= create(:comprehension_regex_rule, rule: required_rule, regex_text: "you need this sequence", sequence_type: 'required')
        assert !required_rule.regex_is_passing?('I do not have the right sequence')
      end

      should 'be true if sequence_type is required and entry matches regex text' do
        required_rule = create(:comprehension_rule)
        @regex_rule_three= create(:comprehension_regex_rule, rule: required_rule, regex_text: "you need this sequence", sequence_type: 'required')
        assert required_rule.regex_is_passing?('you need this sequence and I do have it')
      end

      should 'be true if sequence_type is required and entry matches regex text and there are multiple required sequences' do
        required_rule = create(:comprehension_rule)
        @regex_rule_three= create(:comprehension_regex_rule, rule: required_rule, regex_text: "you need this sequence", sequence_type: 'required')
        @regex_rule_four= create(:comprehension_regex_rule, rule: required_rule, regex_text: "or you need this one", sequence_type: 'required')
        assert required_rule.regex_is_passing?('you need this sequence and I do have it')
      end

      should 'be true if rule is NOT case sensitive and entry matches regardless of casing' do
        required_rule = create(:comprehension_rule)
        @regex_rule_three= create(:comprehension_regex_rule, rule: required_rule, regex_text: "you need this sequence", sequence_type: 'required', case_sensitive: false)
        assert required_rule.regex_is_passing?('YOU NEED THIS SEQUENCE AND I DO HAVE IT')
      end

      should 'be false if rule IS case sensitive and entry does not match casing' do
        required_rule = create(:comprehension_rule)
        @regex_rule_three= create(:comprehension_regex_rule, rule: required_rule, regex_text: "you need this sequence", sequence_type: 'required', case_sensitive: true)
        assert !required_rule.regex_is_passing?('YOU NEED THIS SEQUENCE AND I do not HAVE IT in the right casing')
      end
    end

    context 'one_plagiarism_per_prompt' do
      setup do
        @prompt1 = create(:comprehension_prompt)
        @prompt2 = create(:comprehension_prompt)
        @plagiarism_rule = create(:comprehension_rule, rule_type: Rule::TYPE_PLAGIARISM, prompt_ids: [@prompt1.id])
      end

      should 'creates plagiarism rule if first rule for prompt' do
        assert @plagiarism_rule.valid?
      end

      should 'does not create plagiarism rule if plagiarism rule already exists for prompt' do
        invalid_plagiarism_rule = build(:comprehension_rule, rule_type: Rule::TYPE_PLAGIARISM, prompt_ids: [@prompt1.id])
        assert !invalid_plagiarism_rule.valid?
      end

      should 'creates subsequent plagiarism rule for different prompt' do
        second_plagiarism_rule = build(:comprehension_rule, rule_type: Rule::TYPE_PLAGIARISM, prompt_ids: [@prompt2.id])
        assert second_plagiarism_rule.valid?
      end

      should 'create a different type of rule if it is not plagiarism' do
        valid_automl_rule = build(:comprehension_rule, rule_type: Rule::TYPE_AUTOML, prompt_ids: [@prompt1.id])
        assert valid_automl_rule.valid?
      end
    end

    context '#after_create' do
      context '#assign_to_all_prompts' do
        should 'assign newly created rule to all prompts if the rule is universal' do
          prompt = create(:comprehension_prompt)
          rule = create(:comprehension_rule, universal: true)
          assert_equal prompt.rules.length, 1
          assert rule.prompts.include?(prompt)
        end

        should 'not assign newly created rule to all prompts if the rule is not universal' do
          prompt = create(:comprehension_prompt)
          rule = create(:comprehension_rule, universal: false)
          assert_equal prompt.rules.length, 0
          refute rule.prompts.include?(prompt)
        end

        should 'not assign newly created rules to prompts that somehow already have them assigned' do
          prompt = create(:comprehension_prompt)
          rule = create(:comprehension_rule, universal: true, prompts: [prompt])
          assert_equal prompt.rules.length, 1
          assert rule.prompts.include?(prompt)
        end
      end
    end
  end
end
