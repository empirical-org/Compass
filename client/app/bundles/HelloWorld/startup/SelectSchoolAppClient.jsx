import React from 'react'
import createReactClass from 'create-react-class';
import EducatorType from '../components/accounts/new/educator_type.jsx';
import AnalyticsWrapper from '../components/shared/analytics_wrapper.js'

export default (props) => (
  <EducatorType analytics={new AnalyticsWrapper()}/>
);
