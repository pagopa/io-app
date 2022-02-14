import Pdf from "react-native-pdf";
import React from "react";
import { StyleSheet } from "react-native";
import { Button, Left, Right, View } from "native-base";

import customVariables from "../../../../../../theme/variables";
import AppHeader from "../../../../../../components/ui/AppHeader";
import { Body } from "../../../../../../components/core/typography/Body";
import I18n from "../../../../../../i18n";
import IconFont from "../../../../../../components/ui/IconFont";
import { confirmButtonProps } from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import { ActionConfig } from "../../../../utils";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    // marginTop: 25,
    // height: 300
    backgroundColor: "pink"
  },
  pdf: {
    flex: 1,
    // width: Dimensions.get("window").width,
    // height: Dimensions.get("window").height
    backgroundColor: customVariables.brandDarkGray
  },
  header: {
    alignItems: "center",
    justifyContent: "space-between"
  }
});

const renderFooter = (actionConfig: ActionConfig) =>
  // eslint-disable-next-line no-underscore-dangle
  actionConfig._tag === "ios" ? (
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={confirmButtonProps(
        actionConfig.action,
        I18n.t("features.mvl.details.attachments.pdfPreview.singleBtn")
      )}
    />
  ) : (
    <FooterWithButtons
      type={"ThreeButtonsInLine"}
      leftButton={confirmButtonProps(() => {}, I18n.t("global.buttons.share"))}
      midButton={confirmButtonProps(() => {},
      I18n.t("features.mvl.details.attachments.pdfPreview.save"))}
      rightButton={confirmButtonProps(() => {},
      I18n.t("features.mvl.details.attachments.pdfPreview.open"))}
    />
  );

type Props = { path: string; onClose: () => void; actionConfig: ActionConfig };

const PdfPreview = ({ path, onClose, actionConfig }: Props) => (
  <>
    <AppHeader style={styles.header}>
      <Left>
        <Button
          transparent={true}
          onPress={onClose}
          accessible={true}
          accessibilityRole={"button"}
          accessibilityLabel={I18n.t("global.buttons.back")}
        >
          <IconFont name="io-back" color={customVariables.textColor} />
        </Button>
      </Left>
      <Body color={"bluegreyDark"}>{"anteprima PDF"}</Body>
      <Right>
        <Button
          transparent={true}
          onPress={onClose}
          accessible={true}
          accessibilityRole={"button"}
          accessibilityLabel={I18n.t(
            "global.accessibility.contextualHelp.open.label"
          )}
        >
          <IconFont name="io-help" color={customVariables.textColor} />
        </Button>
      </Right>
    </AppHeader>

    <View style={styles.container}>
      <Pdf
        source={{ uri: path, cache: true }}
        onError={error => {
          console.error(error);
        }}
        style={styles.pdf}
      />
    </View>

    {renderFooter(actionConfig)}

    <View spacer={true} />
  </>
);

export default PdfPreview;
