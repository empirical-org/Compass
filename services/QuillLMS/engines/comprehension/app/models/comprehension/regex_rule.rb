module Comprehension
  class RegexRule < ActiveRecord::Base
    include Comprehension::ChangeLog

    DEFAULT_CASE_SENSITIVITY = true
    MAX_REGEX_TEXT_LENGTH = 200
    CASE_SENSITIVE_ALLOWED_VALUES = [true, false]
    SEQUENCE_TYPES = [
      TYPE_INCORRECT = 'incorrect',
      TYPE_REQUIRED = 'required'
    ]

    belongs_to :rule, inverse_of: :regex_rules
    has_many :change_logs, class_name: "::ChangeLog"

    before_validation :set_default_case_sensitivity, on: :create
    before_save :validate_regex

    validates_presence_of :rule
    validates :regex_text, presence: true, length: {maximum: MAX_REGEX_TEXT_LENGTH}
    validates :case_sensitive, inclusion: CASE_SENSITIVE_ALLOWED_VALUES
    validates :sequence_type, inclusion: SEQUENCE_TYPES

    after_save :log_update

    def serializable_hash(options = nil)
      options ||= {}

      super(options.reverse_merge(
        only: [:id, :rule_id, :regex_text, :case_sensitive, :sequence_type]
      ))
    end

    def entry_failing?(entry)
      # for "incorrect" type regex rules, we want to "fail" if they have the regex. for "required" type regex
      # rules, we want to "fail" when they dont have the regex.
      sequence_type == TYPE_INCORRECT ? regex_match(entry) : !regex_match(entry)
    end

    def incorrect_sequence?
      sequence_type == TYPE_INCORRECT
    end

    private def regex_match(entry)
      case_sensitive? ? Regexp.new(regex_text).match(entry) : Regexp.new(regex_text, Regexp::IGNORECASE).match(entry)
    end

    private def set_default_case_sensitivity
      return if case_sensitive.in? CASE_SENSITIVE_ALLOWED_VALUES
      self.case_sensitive = DEFAULT_CASE_SENSITIVITY
    end

    private def validate_regex
      begin
        Regexp.new(regex_text)
      rescue RegexpError => e
        rule.errors.add(:invalid_regex, e.to_s)
        false
      end
    end

    def log_update
      if regex_text_changed?
        log_change(nil, :update_regex_text, self, {url: rule.url}.to_json, "regex_text", regex_text_was, regex_text)
      end
    end
  end
end
