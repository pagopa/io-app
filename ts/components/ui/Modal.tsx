import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import RNModal, { ModalProps } from "react-native-modal";

export type Props = ModalProps;
/**
 * A customized react-native-modal component.
 * The class is connected with the native-base StyleProvider using the `connectStyle(...)` method.
 */
class Modal extends React.Component<Props> {
  public render(): React.ReactNode {
    return <RNModal {...this.props} />;
  }
}
const StyledModal = connectStyle("UIComponent.Modal", {}, mapPropsToStyleNames)(
  Modal
);
export default StyledModal;
