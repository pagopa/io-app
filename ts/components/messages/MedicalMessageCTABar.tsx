import I18n from "i18n-js";
import * as React from "react";
import FooterWithButtons from "../ui/FooterWithButtons";

type Props = ReadonlyArray<{}>;

export default class MedicalMessageCTABar extends React.PureComponent<Props> {
  public render() {
    return (
      // Convert to BlockButtons
      <FooterWithButtons
        type={"TwoButtonsInlineHalf"}
        leftButton={{
          title: I18n.t("messages.medical.barcodes"),
          bordered: true,
          onPress: () => {
            /** TODO */
          }
        }}
        rightButton={{
          title: I18n.t("messages.medical.share"),
          onPress: () => {
            /** TODO */
          }
        }}
      />
    );
  }
}
