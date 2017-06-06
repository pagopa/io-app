import React, {Component} from 'react';

import { createTemplate } from './Calendar.template';
import type { Dispatch } from '../actions/types'
import type { UserState } from '../reducers/user'

export default class CalendarComponent extends React.Component {

  props: {
    dispatch: Dispatch,
    user: UserState,
  };

  render() {

    const markup = createTemplate(this.props);
    return markup;
  }
}
