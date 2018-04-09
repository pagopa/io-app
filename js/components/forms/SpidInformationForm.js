// @flow

import * as React from 'react'
import { type FormProps, reduxForm, Field } from 'redux-form'
import { Form } from 'native-base'

import {
  renderNativeBaseInput,
  validators,
  getTraslatedFormFieldPropertyValue
} from './utils'

type OwnProps = {}

type Props = FormProps & OwnProps

export const FORM_NAME = 'spidInformation'

const getCurrentFormFieldProperty = getTraslatedFormFieldPropertyValue(
  FORM_NAME
)

/**
 * A form to collect the user email address
 */
class SpidInformationForm extends React.Component<Props> {
  render(): React.Node {
    return (
      <Form>
        <Field
          name="email"
          component={renderNativeBaseInput}
          placeholder={getCurrentFormFieldProperty('email')('placeholder')}
          validate={[validators.required, validators.email]}
          showError
        />
      </Form>
    )
  }
}

export default reduxForm({
  form: FORM_NAME
})(SpidInformationForm)
