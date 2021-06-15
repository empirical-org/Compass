import * as React from "react";
import { RouteComponentProps } from 'react-router-dom'
import { useQuery } from 'react-query';
import { firstBy } from "thenby";
import ReactTable from 'react-table';
import qs from 'qs';
import * as _ from 'lodash'

import { sort } from '../../../../../modules/sortingMethods.js';
import { fetchChangeLog } from '../../../utils/comprehension/activityAPIs';
import { DropdownInput, Spinner, } from '../../../../Shared/index';

interface ChangeLogProps {

}

const ChangeLog = ({ history, match }) => {
  const { params } = match;
  const { activityId, } = params;
  const [searchInput, setSearchInput] = React.useState<string>('');
  const [prompt, setPrompt] = React.useState<string>('All Prompts');

  // get cached activity data to pass to rule
  const { data: changeLogData } = useQuery({
    queryKey: [`activity-${activityId}`, activityId],
    queryFn: fetchChangeLog
  });

  function handleSearch(e) {
    setSearchInput(e.target.value)
  }

  function handlePromptChange(e) {
    setPrompt(e.target.value)
  }

  const promptDropdown = (
      <p className="control">
        <span className="select">
          <select defaultValue={'All Prompts'} onChange={handlePromptChange}>
            <option value="all">All Prompts</option>
            <option value="because">because</option>
            <option value="but">but</option>
            <option value="so">so</option>
          </select>
        </span>
      </p>
  )

  const formattedRows = changeLogData && changeLogData.changeLogs && changeLogData.changeLogs.map(log => {
    const {
      action,
      changed_record_id,
      updated_local_time,
      previous_value,
      new_value,
      record_type_display_name,
      user,
      explanation
    } = log;

    const changedRecord = `${record_type_display_name} - ${changed_record_id}`
    const actionLink = explanation && JSON.parse(explanation).url
    const prompt = explanation && JSON.parse(explanation).conjunction

    return {
      action: action,
      changedRecord: changedRecord,
      previousValue: previous_value,
      newValue: new_value,
      author: user,
      dateTime: updated_local_time,
      actionLink: actionLink,
      prompt: prompt
    }
  })

  const filteredRows = formattedRows && formattedRows.filter(value => {
    return (value.action.toLowerCase().includes(searchInput.toLowerCase()) ||
    (value.previousValue && value.previousValue.toLowerCase().includes(searchInput.toLowerCase())) ||
    (value.newValue && value.newValue.toLowerCase().includes(searchInput.toLowerCase())))
  }).filter(value => {
    return prompt === 'All Prompts' || value.prompt === null || value.prompt === prompt
  })

  const dataTableFields = [
    {
      Header: 'Action',
      accessor: "action",
      sortMethod: sort,
      width: 160,
      Cell: cell => (<a href={cell.original.actionLink} rel="noopener noreferrer" target="_blank">{cell.original.action}</a>)
    },
    {
      Header: 'Change Record',
      accessor: "changedRecord",
      key: "changedRecord",
      sortMethod: sort,
      width: 160,
    },
    {
      Header: 'Previous Value',
      accessor: "previousValue",
      key: "previousValue",
      sortMethod: sort,
      width: 200,
    },
    {
      Header: 'New Value',
      accessor: "newValue",
      key: "newValue",
      sortMethod: sort,
      width: 200,
    },
    {
      Header: 'Author',
      accessor: "author",
      key: "author",
      sortMethod: sort,
      width: 160,
    },
    {
      Header: 'Date/Time',
      accessor: "dateTime",
      key: "dateTime",
      sortMethod: sort,
      width: 160,
    }
  ];

  if (!formattedRows) {
    return <Spinner />
  }

  console.log(formattedRows)
  console.log(filteredRows)

  return(
    <div className="activity-stats-container">
      <h1>Change Log</h1>
      {promptDropdown}
      <input
        aria-label="Search by action or value"
        className="search-box"
        name="searchInput"
        onChange={handleSearch}
        placeholder="Search by action or value"
        value={searchInput || ""}
        style={{width: '500px'}}
      />
      <br/><br/>
      {formattedRows && (<ReactTable
        className="activity-stats-table"
        columns={dataTableFields}
        data={filteredRows || []}
        defaultPageSize={filteredRows.length}
        defaultSorted={[{id: 'dateTime', desc: true}]}
        showPagination={false}
      />)}
    </div>
  );

}

export default ChangeLog
