// @flow

import * as React from 'react'
import { View } from 'react-native'
import { type ViewProps } from 'ViewPropTypes'
import mapPropsToStyleNames from 'native-base/src/Utils/mapPropsToStyleNames.js'
import { connectStyle } from 'native-base-shoutem-theme'

type Props = ViewProps

/**
 * A simple component to display an Icon and a Text side-by-side
 */
class TextWithIcon extends React.Component<Props> {
  render(): React.Node {
    return <View {...this.props} />
  }
}

const StyledTextWithIcon = connectStyle(
  'UIComponents.TextWithIcon',
  {},
  mapPropsToStyleNames
)(TextWithIcon)

export default StyledTextWithIcon
