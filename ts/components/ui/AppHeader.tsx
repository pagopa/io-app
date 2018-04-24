import * as React from 'react'
import variables from '../../theme/variables'
import { Header, NativeBase } from 'native-base'

export type Props = NativeBase.Header
/**
 * A customized Header component.
 */
export default function AppHeader(props: Props): React.ReactNode {
  return (
    <Header
      androidStatusBarColor={variables.androidStatusBarColor}
      iosBarStyle="dark-content"
      {...props}
    />
  )
}
