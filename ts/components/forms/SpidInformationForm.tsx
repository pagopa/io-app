import * as React from 'react'
import {
  reduxForm,
  Field,
  FormProps,
  FormErrors,
  WrappedFieldProps,
  BaseFieldsProps,
  BaseFieldProps,
  InjectedFormProps
} from 'redux-form'
import { Form } from 'native-base'
import {
  renderNativeBaseInput,
  validators,
  getTraslatedFormFieldPropertyValue
} from './utils'
import { Dispatch, ReduxProps } from '../../actions/types'
import { connect } from 'react-redux'
import IdpSelectionScreen from '../../screens/authentication/IdpSelectionScreen'

export const FORM_NAME = 'spidInformation'
const getCurrentFormFieldProperty = getTraslatedFormFieldPropertyValue(
  FORM_NAME
)

/**
 * A form to collect the user email address
 */
class SpidInformationForm extends React.Component<InjectedFormProps, never> {
  render() {
    return (
      <Form>
        <Field
          name="email"
          component={renderNativeBaseInput}
          placeholder={getCurrentFormFieldProperty('email')('placeholder')}
          validate={[validators.email]}
          showError
        />
      </Form>
    )
  }
}
export default reduxForm({
  form: FORM_NAME
})(SpidInformationForm)
