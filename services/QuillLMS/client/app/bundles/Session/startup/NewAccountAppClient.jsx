import React from 'react';
import NewAccount from '../../Teacher/components/accounts/new/new_account_stage1.jsx';

export default React.createClass({
  render: function() {
    return (
      <NewAccount {...this.props} />
    )
  }
});
