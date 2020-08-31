import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import { TextInputMask } from "react-native-masked-text";

export default connectStyle<TextInputMask>(
  "UIComponent.MaskedInput",
  {},
  mapPropsToStyleNames
)(TextInputMask);
