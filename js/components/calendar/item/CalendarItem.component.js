'use strict'
const React = require('React');

import createTemplate from './CalendarItem.template';

class CalendarItem extends React.Component {

  props: {
    last?: boolean,
    date: string,
    title: string,
    amount: string,
  }

  render() {

    const markup = createTemplate(this.props);
		return markup;
  }
}
