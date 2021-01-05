import * as React from "react";

import { DataTable, Spinner } from '../../../../Shared/index';
import { PROMPT_ATTEMPTS_FEEDBACK_LABELS, PROMPT_HEADER_LABELS } from '../../../../../constants/comprehension';

const SessionsIndex = ({ activity, prompt, showHeader }) => {


  function formatFirstTableData(prompt: any) {
    const { attempts } = prompt;
    const keys = attempts && Object.keys(attempts);
    let completed: boolean;
    if(keys.length === 5) {
      completed = true;
    } else {
      const usedAttempts = [];
      keys.forEach(key => {
        attempts[key].forEach((attempt: any) => {
          // only get
          if(attempt.used) {
            usedAttempts.push(attempt);
          }
        });
      });
      completed = !!usedAttempts.some((attempt) => attempt.optimal);
    }
    return {
      attemptsLabel: 'Attempts',
      attemptsValue: keys.length,
      completedLabel: 'Completed',
      completedValue: completed ? 'True' : 'False'
    }
  }

  function formatFeedbackData(prompt: any) {
    const { attempts, prompt_id } = prompt;
    const { prompts } = activity;
    const matchedPrompt = prompts.filter(prompt => prompt.id === prompt_id)[0];
    const keys = attempts && Object.keys(attempts);
    const rows = [];
    keys.map((key: any, i: number) => {
      const attempt = attempts[key][0];
      const { entry, feedback_text, feedback_type } = attempt;
      const { attemptLabel, feedbackLabel } = PROMPT_ATTEMPTS_FEEDBACK_LABELS[key];
      const attemptObject: any = {};
      const feedbackObject: any = {};
      attemptObject.status = attemptLabel;
      attemptObject.results = (<div>
        <b>{matchedPrompt && matchedPrompt.text}</b>
        <p className="entry">{entry}</p>
      </div>);
      feedbackObject.status = feedbackLabel;
      feedbackObject.results = feedback_text;
      feedbackObject.feedback = feedback_type;
      rows.push(attemptObject);
      rows.push(feedbackObject);
    });
    return rows;
  }

  if(!prompt) {
    return(
      <div className="loading-spinner-container">
        <Spinner />
      </div>
    );
  }

  const dataTableFields = [
    { name: "Status", attribute:"status", width: "100px" },
    { name: "Results", attribute:"results", width: "500px" },
    { name: "Feedback Type", attribute:"feedback", width: "100px" }
  ];

  const { conjunction } = prompt;
  const firstTableData = formatFirstTableData(prompt);
  const { attemptsLabel, attemptsValue, completedLabel, completedValue } = firstTableData

  return(
    <section className="prompt-table-container">
      {showHeader && <h2>{PROMPT_HEADER_LABELS[conjunction]}</h2>}
      <section className="attempts-section">
        <p className="attempts-label">{attemptsLabel}</p>
        <p className="attempts-value">{attemptsValue}</p>
      </section>
      <section className="completed-section">
        <p className="completed-label">{completedLabel}</p>
        <p className="completed-value">{completedValue}</p>
      </section>
      <DataTable
        className="attempts-feedback-table"
        headers={dataTableFields}
        rows={formatFeedbackData(prompt)}
      />
    </section>
  );
}

export default SessionsIndex
