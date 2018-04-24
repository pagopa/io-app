import * as React from 'react'
import { FormProps, reduxForm, Field } from 'redux-form'
import { Form } from 'native-base'
import {
  renderNativeBaseInput,
  validators,
  getTraslatedFormFieldPropertyValue
} from './utils'
export type OwnProps = {}
export type Props = FormProps & OwnProps
export const FORM_NAME = 'spidInformation'
const getCurrentFormFieldProperty = getTraslatedFormFieldPropertyValue(
  FORM_NAME
)
/**
 * A form to collect the user email address
 */
class SpidInformationForm extends React.Component<Props, never> {
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
