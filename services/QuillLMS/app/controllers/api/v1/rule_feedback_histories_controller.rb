class Api::V1::RuleFeedbackHistoriesController < Api::ApiController
    def by_conjunction
        raise ArgumentError unless params.include?('activity_id') && params.include?('conjunction')
        start_date = params['start_date'] || FeedbackHistory.first.created_at.iso8601
        end_date = params['end_date'] || Time.now.iso8601
        report = RuleFeedbackHistory.generate_report(
            conjunction: params['conjunction'],
            activity_id: params['activity_id'],
            start_date: start_date,
            end_date: end_date
        )
        render(json: report)
    end

    def rule_detail
        raise ArgumentError unless params.include?('rule_uid') && params.include?('prompt_id')
        report = RuleFeedbackHistory.generate_rulewise_report(
            rule_uid: params['rule_uid'],
            prompt_id: params['prompt_id']
        )
        render(json: report)
    end

    def prompt_health
        raise ArgumentError unless params.include?('activity_id')
        report = PromptFeedbackHistory.run(params['activity_id'])
        render(json: report)
    end
end
