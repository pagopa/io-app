import * as React from 'react'
import variables from '../../theme/variables'
import { Header, NativeBase } from 'native-base'

export type Props = NativeBase.Header

/**
 * A customized Header component.
 */
const AppHeader: React.SFC<Props> = (props) => {
  return (
    <Header
      androidStatusBarColor={variables.androidStatusBarColor}
      iosBarStyle="dark-content"
      {...props}
    />
  )
}

export default AppHeader
