import * as React from "react";
import { IconButton } from "@pagopa/io-app-design-system";
import I18n from "../i18n";
import { clipboardSetStringWithFeedback } from "../utils/clipboard";

type Props = Readonly<{
  textToCopy: string;
}>;

const CopyButtonComponent: React.FunctionComponent<Props> = (props: Props) => {
  const handlePress = () => {
    clipboardSetStringWithFeedback(props.textToCopy);
  };

  return (
    <IconButton
      icon="copy"
      onPress={handlePress}
      accessibilityLabel={I18n.t("global.buttons.copy")}
    />
  );
};

export default CopyButtonComponent;
