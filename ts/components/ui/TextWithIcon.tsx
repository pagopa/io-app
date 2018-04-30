import * as React from 'react'
import { View, ViewProperties } from 'react-native'
import mapPropsToStyleNames from 'native-base/src/Utils/mapPropsToStyleNames.js'
import { connectStyle } from 'native-base-shoutem-theme'

type Props = ViewProperties

/**
 * A simple wrapper where you can put an Icon and a Text components that will be rendered side-by-side.
 *
 * More @https://github.com/teamdigitale/italia-app#textwithicon
 */
class TextWithIcon extends React.Component<Props> {
  render() {
    return <View {...this.props} />
  }
}

const StyledTextWithIcon = connectStyle(
  'UIComponents.TextWithIcon',
  {},
  mapPropsToStyleNames
)(TextWithIcon)

export default StyledTextWithIcon
