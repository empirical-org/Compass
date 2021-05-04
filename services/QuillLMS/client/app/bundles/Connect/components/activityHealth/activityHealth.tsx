import * as React from 'react'
import ReactTable from 'react-table'
import { matchSorter } from 'match-sorter';
import 'react-table/react-table.css';
import request from 'request'
import _ from 'underscore'
import stripHtml from "string-strip-html"
import { CSVLink } from 'react-csv'

import LoadingSpinner from '../shared/loading_indicator.jsx'
import { sort, sortByList } from '../../../../modules/sortingMethods.js'
import { FlagDropdown } from '../../../Shared/index'
import PromptHealth from './promptHealth'
import { selectColumnFilter } from '../../../../modules/filteringMethods.js'
import { getDataFromTree } from 'react-apollo';
import activity from '../../../Staff/components/comprehension/activity.js';

const recentPlaysText = "Number of plays in the last 3 months if the activity's first play was more than 3 months ago"


class ActivityHealth extends React.Component<ComponentProps, any> {

  state = {
    loadingTableData: true,
    activityId: '',
    fetchedData: [],
    activityHealthFlags: "All Flags",
    searchInput: "",
    dataToDownload: []
  };

  componentDidMount() {
    this.fetchQuestionData();
  }

  renderTable() {
    const { loadingTableData } = this.state
    if(loadingTableData) {
      return <LoadingSpinner />
    }
    return (this.tableOrEmptyMessage())
  }

  columnDefinitions() {
    return [
      {
        Header: 'Name',
        accessor: 'name',
        filterMethod: (filter, rows) =>
                    matchSorter(rows, filter.value, { keys: ["name"] }),
        filterAll: true,
        resizeable: true,
        minWidth: 200,
        sortMethod: sort,
        Cell: cell => (<a href={cell.original.url} target="_blank">{cell.original.name}</a>)
      },
      {
        Header: 'Activity Categories',
        accessor: 'activity_categories',
        filterMethod: (filter, rows) =>
                    matchSorter(rows, filter.value, { keys: ["activity_categories"] }),
        filterAll: true,
        resizeable: false,
        sortMethod: sortByList,
        Cell: (row) => (
          <div>
            {
            row.original['activity_categories'].map((ap) => (
              <div>{ap}</div>
            ))
            }
          </div>
        )
      },
      {
        Header: 'Tool',
        accessor: 'tool',
        filterMethod: (filter, row) => {
          if (filter.value === "all") {
            return true;
          }
          else {
            return row[filter.id] === filter.value
          }
        },
        Filter: ({ filter, onChange }) =>
          <select
            onChange={event => onChange(event.target.value)}
            style={{ width: "100%" }}
            value={filter ? filter.value : "all"}
          >
            <option value="all">All</option>
            <option value="connect">Connect</option>
            <option value="grammar">Grammar</option>
          </select>,
        resizeable: false,
        sortMethod: sort,
        minWidth: 90,
        Cell: props => props.value
      },
      {
        Header: "Recent Plays",
        accessor: 'recent_plays',
        filterMethod: (filter, row) => {
          let value = filter.value
          if (value.includes("-")) {
            let splitStr = filter.value.split("-")
            if (!isNaN(parseFloat(splitStr[0])) && !isNaN(parseFloat(splitStr[1]))) {
              return row[filter.id] >= splitStr[0] && row[filter.id] <= splitStr[1];
            } else {
              return true;
            }
          } else if (value.includes(">")) {
            let splitStr = filter.value.split(">")
            if (!isNaN(parseFloat(splitStr[1]))) {
              return row[filter.id] > splitStr[1]
            } else {
              return true;
            }
          } else if (value.includes("<")) {
            let splitStr = filter.value.split("<")
            if (!isNaN(parseFloat(splitStr[1]))) {
              return row[filter.id] < splitStr[1]
            } else {
              return true;
            }
          } else {
            return true;
          }
        },
        Filter: ({ filter, onChange }) =>
        <div
          style={{
            display: 'flex',
          }}
        >
          <input
            value={filter ? filter.value : ''}
            type="text"
            onChange={e =>
              onChange(e.target.value)
            }
            placeholder={`0-5, >1, <1`}
            style={{
              width: '100px',
              marginRight: '0.5rem',
            }}
          />
        </div>
        ,
        resizeable: false,
        sortMethod: sort,
        Cell: props => props.value,
        maxWidth: 90
      },
      {
        Header: 'Diagnostics',
        accessor: 'diagnostics',
        filterMethod: (filter, rows) =>
                    matchSorter(rows, filter.value, { keys: ["diagnostics"] }),
        filterAll: true,
        resizeable: false,
        sortMethod: sortByList,
        Cell: (row) => (
          <div>
            {
            row.original['diagnostics'].map((diagnostic) => (
              <div>{diagnostic}</div>
            ))
            }
          </div>
        ),
        maxWidth: 90
      },
      {
        Header: 'Activity Packs',
        accessor: 'activity_packs',
        filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["activity_packs.*.name"] }),
        filterAll: true,
        resizeable: false,
        sortMethod: sortByList,
        Cell: (row) => (
          <div>
            {
            row.original['activity_packs'].map((ap) => (
              <div>{ap.name}</div>
            ))
            }
          </div>
        ),
        maxWidth: 150
      },
      {
        Header: 'Average Time Spent',
        accessor: 'avg_mins_to_complete',
        filterMethod: (filter, row) => {
          let splitStr = filter.value.split("-")
          if (!isNaN(parseFloat(splitStr[0])) && !isNaN(parseFloat(splitStr[1]))) {
            return row[filter.id] >= splitStr[0] && row[filter.id] <= splitStr[1];
          } else {
            return true;
          }
        },
        Filter: ({ filter, onChange }) =>
        <div
          style={{
            display: 'flex',
          }}
        >
          <input
            value={filter ? filter.value : ''}
            type="text"
            onChange={e =>
              onChange(e.target.value)
            }
            placeholder={`e.g. 0-30`}
            style={{
              width: '100px',
              marginRight: '0.5rem',
            }}
          />
        </div>
        ,
        resizeable: false,
        sortMethod: sort,
        Cell: props => props.value,
        maxWidth: 150
      },
      {
        Header: 'Average Difficulty',
        accessor: 'avg_difficulty',
        filterMethod: (filter, row) => {
          let splitStr = filter.value.split("-")
          if (!isNaN(parseFloat(splitStr[0])) && !isNaN(parseFloat(splitStr[1]))) {
            return row[filter.id] >= splitStr[0] && row[filter.id] <= splitStr[1];
          } else {
            return true;
          }
        },
        Filter: ({ filter, onChange }) =>
        <div
          style={{
            display: 'flex',
          }}
        >
          <input
            value={filter ? filter.value : ''}
            type="text"
            onChange={e =>
              onChange(e.target.value)
            }
            placeholder={`e.g. 0-5`}
            style={{
              width: '100px',
              marginRight: '0.5rem',
            }}
          />
        </div>
        ,
        resizeable: false,
        sortMethod: sort,
        Cell: props => props.value,
        maxWidth: 150
      },
      {
        Header: 'Standard Deviation Difficulty',
        accessor: 'standard_dev_difficulty',
        filterMethod: (filter, row) => {
          let splitStr = filter.value.split("-")
          if (!isNaN(parseFloat(splitStr[0])) && !isNaN(parseFloat(splitStr[1]))) {
            return row[filter.id] >= splitStr[0] && row[filter.id] <= splitStr[1];
          } else {
            return true;
          }
        },
        Filter: ({ filter, onChange }) =>
        <div
          style={{
            display: 'flex',
          }}
        >
          <input
            value={filter ? filter.value : ''}
            type="text"
            onChange={e =>
              onChange(e.target.value)
            }
            placeholder={`e.g. 0-5`}
            style={{
              width: '100px',
              marginRight: '0.5rem',
            }}
          />
        </div>
        ,
        resizeable: false,
        sortMethod: sort,
        Cell: props => props.value,
        maxWidth: 150
      },
      {
        Header: 'Average Common Unmatched',
        accessor: 'avg_common_unmatched',
        filterMethod: (filter, row) => {
          let splitStr = filter.value.split("-")
          if (!isNaN(parseFloat(splitStr[0])) && !isNaN(parseFloat(splitStr[1]))) {
            return row[filter.id] >= splitStr[0] && row[filter.id] <= splitStr[1];
          } else {
            return true;
          }
        },
        Filter: ({ filter, onChange }) =>
        <div
          style={{
            display: 'flex',
          }}
        >
          <input
            value={filter ? filter.value : ''}
            type="text"
            onChange={e =>
              onChange(e.target.value)
            }
            placeholder={`e.g. 0-100`}
            style={{
              width: '100px',
              marginRight: '0.5rem',
            }}
          />
        </div>
        ,
        resizeable: false,
        sortMethod: sort,
        Cell: props => props.value,
        maxWidth: 150
      }
    ];
  }

  fetchQuestionData() {
    this.setState({ loadingNewTableData: true }, () => (console.log("setting loadingNewTableData")));
    request.get({
      url: 'https://www.quill.org/api/v1/activities/activities_health.json',
    }, (e, r, body) => {
      let newState = {}
      if (e || r.statusCode != 200) {
        newState = {
          loadingTableData: false,
          dataResults: [],
        }
      } else {
        const data = JSON.parse(body);
        console.log(data)
        newState = {
          loadingTableData: false,
          fetchedData: data.activities_health
        };
      }

      this.setState(newState, () => (console.log("setting fetchedData")));
    });
  }

  download = (event) => {
    const currentRecords = this.reactTable.getResolvedState().sortedData;
    var data_to_download = []
    for (var index = 0; index < currentRecords.length; index++) {
       let record_to_download = {}
       let columns = this.columnDefinitions()
       for(var colIndex = 0; colIndex < columns.length ; colIndex ++) {
          record_to_download[columns[colIndex].Header] = currentRecords[index][columns[colIndex].accessor]
       }
       data_to_download.push(record_to_download)
    }
    let clonedData = JSON.parse(JSON.stringify(data_to_download));
    clonedData.forEach(item=> {
      item["Activity Packs"] = item["Activity Packs"].map(v => v.name)
    });
    this.setState({ dataToDownload: clonedData }, () => {
       // click the CSVLink component to trigger the CSV download
       this.csvLink.link.click();
       console.log("setting data to download")
    })
  }

  tableOrEmptyMessage() {
    const { fetchedData } = this.state

    let tableOrEmptyMessage

    if (fetchedData) {
      let dataToUse = this.getFilteredData()
      tableOrEmptyMessage = (<ReactTable ref={(r) => this.reactTable = r}
        autoResetExpanded={false}
        className='records-table'
        columns={this.columnDefinitions()}
        data={dataToUse}
        defaultPageSize={dataToUse.length}
        defaultSorted={[{id: 'name', desc: false}]}
        filterable
        defaultFilterMethod={(filter, row) =>
          String(row[filter.id]) === filter.value}
        loading={false}
        pages={1}
        showPageSizeOptions={false}
        showPagination={false}
        showPaginationBottom={false}
        showPaginationTop={false}
        SubComponent={row => {
          console.log(row.original.prompt_healths)
          return (
            <PromptHealth
            dataResults={row.original.prompt_healths}/>
          );
        }}
      />)
    } else {
      tableOrEmptyMessage = "Activity Health data could not be found. Refresh to try again, or contact the engineering team."
    }
      return (
        <div>
          {tableOrEmptyMessage}
        </div>
      )
  }

  getFilteredData() {
    const { fetchedData, activityHealthFlags, searchInput } = this.state
    let filteredByFlags = activityHealthFlags === 'All Flags' ? fetchedData : fetchedData.filter(data => data.flag === activityHealthFlags)
    let filteredByFlagsAndPrompt = filteredByFlags.filter(value => {
      return (
        value.prompt_healths.map(x => x.text || '').some(y => stripHtml(y).toLowerCase().includes(searchInput.toLowerCase()))
      );
    })
    return filteredByFlagsAndPrompt
  }

  handleSelect = (e) => {
    this.setState({ activityHealthFlags: e.target.value, }, () => (console.log("setting flags")))
  }

  handleSearch = (e) => {
    this.setState({ searchInput: e.target.value }, () => (console.log("setting search input")))
  }

  render() {
    const { searchInput } = this.state
    return (
      <section className="section">
        <div style={{display: 'inline-block', width: '100%'}}>
        <div style={{display: 'inline-block', marginLeft: '10px', float: 'left'}}>
          <FlagDropdown flag={this.state.activityHealthFlags} handleFlagChange={this.handleSelect} isLessons={true} />
          <input
          name="searchInput"
          value={searchInput || ""}
          placeholder="Search by prompt"
          onChange={this.handleSearch}
          style={{border: "1px solid rgba(0,0,0,0.1)",
            background: "#fff",
            padding: "5px 7px",
            fontSize: "inherit",
            borderRadius: "3px",
            fontWeight: "normal",
            outlineWidth: "0",
            marginTop: "10px",
            width: "700px"}}
        />
        </div>
        <div>
        <div style = {{
          display: "inline-block",
          float: "right",
          border: "1px solid rgba(0,0,0,0.1)",
          background: "#fff",
          padding: "5px 7px",
          fontSize: "inherit",
          borderRadius: "3px",
          fontWeight: "normal",
          outlineWidth: "0",
          cursor: 'pointer'
        }
        }>
        <button style={{cursor: 'pointer'}}onClick={this.download}>
            Download CSV
        </button>
        </div>
        <div>
        <CSVLink
          data={this.state.dataToDownload}
          filename="activity_health_report"
          ref={(r) => this.csvLink = r}
          target="_blank" />
        </div>

        </div>
        </div>

        <div className="large-admin-container">
          <div className="standard-columns">
          {this.renderTable()}
          </div>
        </div>
      </section>
    )
  }
}

export default ActivityHealth
