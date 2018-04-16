// @flow

import * as React from 'react'
import { type ViewProps } from 'ViewPropTypes'
import variables from '../../theme/variables'
import { Header } from 'native-base'

// Mapped from PropTypes @https://github.com/GeekyAnts/NativeBase/blob/master/src/basic/Header.js
type OwnProps = {
  searchBar: boolean,
  rounded: boolean
}

type Props = ViewProps | OwnProps

/**
 * A customized Header component.
 */
export default function AppHeader(props: Props): React.Node {
  return (
    <Header
      androidStatusBarColor={variables.androidStatusBarColor}
      iosBarStyle="dark-content"
      {...props}
    />
  )
}
