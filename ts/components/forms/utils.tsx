/**
 * Useful methods to interact with redux-form
 */

import * as React from 'react'
import { WrappedFieldProps, BaseFieldProps } from 'redux-form'
import { Item, Input, View, Text } from 'native-base'
import { isEmail } from 'validator'

import I18n from '../../i18n'

const getValidatorMessage = (validatorId: string): string => {
  return I18n.t(`forms.validators.${validatorId}`)
}

const required = (value: string): string | undefined =>
  value ? undefined : getValidatorMessage('required')

const email = (value: string): string | undefined =>
  value && !isEmail(value) ? getValidatorMessage('email') : undefined

/**
 * A utility function that return the translated value for a property of a form field.
 */
export const getTraslatedFormFieldPropertyValue = (
  formId: string
): ((string) => (string) => string) => (
  fieldId: string
): ((string) => string) => (propertyId: string): string => {
  return I18n.t(`forms.${formId}.fields.${fieldId}.${propertyId}`)
}

/**
 * Methods used to validate redux-form `Field` components.
 * All methods takes a string, which represents the field value, as argument and returns
 * a error message if the validation is not fulfilled.
 */
export const validators = {
  required,
  email
}

export interface NativeBaseInputProps {
  placeholder?: string
  showError?: boolean
}

/**
 * This method is used by redux-form `Field` components.
 * It takes as input the field properties and return a native-base `Input`.
 */
export const renderNativeBaseInput = (
  props: WrappedFieldProps & BaseFieldProps & NativeBaseInputProps
) => {
  const {
    input,
    meta: { touched, error, active },
    placeholder,
    showError
  } = props
  return (
    <View>
      <Item error={error && touched} active={active}>
        <Input placeholder={placeholder} />
      </Item>
      {showError && error && touched && <Text>{error}</Text>}
    </View>
  )
}
