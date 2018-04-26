import * as React from 'react'
import RNModal, { ModalProps } from 'react-native-modal'
import mapPropsToStyleNames from 'native-base/src/Utils/mapPropsToStyleNames.js'
import { connectStyle } from 'native-base-shoutem-theme'

export type Props = ModalProps
/**
 * A customized react-native-modal component.
 * The class is connected with the native-base StyleProvider using the `connectStyle(...)` method.
 */
class Modal extends React.Component<Props> {
  render(): React.ReactNode {
    return <RNModal {...this.props} />
  }
}
const StyledModal = connectStyle(
  'UIComponents.Modal',
  {},
  mapPropsToStyleNames
)(Modal)
export default StyledModal
