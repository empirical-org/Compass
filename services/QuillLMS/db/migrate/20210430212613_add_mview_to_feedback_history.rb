class AddMviewToFeedbackHistory < ActiveRecord::Migration
  def up
    sql = <<~SQL 
      CREATE MATERIALIZED VIEW feedback_histories_grouped_by_rule_uid AS
      select ARRAY_AGG(id) as feedback_history_ids, rule_uid from feedback_histories 
      GROUP BY rule_uid;
      

      CREATE INDEX index_feedback_histories_on_rule_uid_grouped 
      ON public.feedback_histories_grouped_by_rule_uid USING btree (rule_uid);
    SQL

    execute sql
  end

  def down 
    sql = <<~SQL 
      DROP INDEX IF EXISTS index_feedback_histories_on_rule_uid_grouped; 
      DROP MATERIALIZED VIEW IF EXISTS feedback_histories_grouped_by_rule_uid
    SQL

    execute sql
  end
end
