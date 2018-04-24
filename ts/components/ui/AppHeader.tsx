import * as React from 'react'
import { ViewProps } from 'ViewPropTypes'
import variables from '../../theme/variables'
import { Header } from 'native-base'
// Mapped from PropTypes @https://github.com/GeekyAnts/NativeBase/blob/master/src/basic/Header.js
export type OwnProps = {
  searchBar: boolean,
  rounded: boolean
}
export type Props = ViewProps | OwnProps
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
