// @flow

import * as React from 'react'
import CodeInput from 'react-native-confirmation-code-input'
import color from 'color'

import { PIN_LENGTH } from '../utils/constants'
import variables from '../theme/variables'

type OwnProps = {
  autofocus: boolean,
  compareWithCode?: string,
  onFulfill:
    | ((code: string) => void)
    | ((isValid: boolean, code: string) => void)
}

type Props = OwnProps

/**
 * A customized CodeInput component.
 */
export default function Pinpad(props: Props): React.Node {
  const { autofocus, compareWithCode, onFulfill } = props
  return (
    <CodeInput
      secureTextEntry
      keyboardType="numeric"
      autoFocus={autofocus}
      className="border-b"
      codeLength={PIN_LENGTH}
      compareWithCode={compareWithCode || ''}
      cellBorderWidth={2}
      inactiveColor={color(variables.brandLightGray)
        .rgb()
        .string()}
      activeColor={color(variables.brandDarkGray)
        .rgb()
        .string()}
      onFulfill={onFulfill}
      codeInputStyle={{ fontSize: variables.fontSize5, height: 56 }}
    />
  )
}
