// @flow

import * as React from 'react'
import { type FormProps, reduxForm, Field } from 'redux-form'
import { Form } from 'native-base'

import { renderNBInput, validators, getFormFieldProperty } from './utils'

type OwnProps = {}

type Props = FormProps & OwnProps

export const FORM_NAME = 'spidInformation'

const getCurrentFormFieldProperty = getFormFieldProperty(FORM_NAME)

/**
 * A form with an TextInput to insert an email
 */
class SpidInformationForm extends React.Component<Props> {
  render(): React.Node {
    return (
      <Form>
        <Field
          name="email"
          component={renderNBInput}
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
