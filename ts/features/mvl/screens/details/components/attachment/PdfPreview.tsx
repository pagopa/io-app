import { Button, Container, H1, Left, Right, View } from "native-base";
import customVariables from "../../../../../../theme/variables";
import AppHeader from "../../../../../../components/ui/AppHeader";
import { Body } from "../../../../../../components/core/typography/Body";
import I18n from "../../../../../../i18n";
import IconFont from "../../../../../../components/ui/IconFont";
import Pdf from "react-native-pdf";
import React from "react";
import { StyleSheet } from "react-native";
import { confirmButtonProps } from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";

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

type Props = { path: string; onClose: () => void };

const PdfPreview = ({ path, onClose }: Props) => {
  return (
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
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Number of pages: ${numberOfPages} - ${filePath}`);
          }}
          onPageChanged={(page, _numberOfPages) => {
            console.log(`Current page: ${page}`);
          }}
          onError={error => {
            console.log(error);
          }}
          onPressLink={uri => {
            console.log(`Link pressed: ${uri}`);
          }}
          style={styles.pdf}
        />
      </View>

      <FooterWithButtons
        type={"SingleButton"}
        leftButton={confirmButtonProps(() => {},
        I18n.t("global.buttons.retry"))}
      ></FooterWithButtons>
    </>
  );
};

export default PdfPreview;
