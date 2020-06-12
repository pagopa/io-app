import { fromNullable } from "fp-ts/lib/Option";
import { Button, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import CopyButtonComponent from "../../../components/CopyButtonComponent";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import { useHardwareBackButton } from "./hooks/useHardwareBackButton";

type Props = {
  onClose: () => void;
  qrCode: string;
  secretCode: string;
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  modalBox: {
    position: "absolute",
    bottom: 0,
    height: 466,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    alignSelf: "center",
    width: "95%",
    backgroundColor: customVariables.colorWhite,
    paddingLeft: 16,
    paddingRight: 13,
    paddingTop: 16
  },
  image: {
    height: 249,
    width: 249,
    alignSelf: "center"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  title: {
    fontSize: 18,
    color: customVariables.lightGray,
    alignSelf: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    lineHeight: customVariables.lineHeightBase
  },
  modalClose: {
    flex: 1,
    paddingRight: 0,
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  codeText: {
    alignSelf: "center",
    fontSize: customVariables.fontSize2,
    lineHeight: 27,
    color: customVariables.selectedColor
  },
  uniqueCode: {
    fontSize: customVariables.fontSizeSmall,
    color: customVariables.textColor
  },
  bonusLogo: {
    height: 48,
    width: 48
  },
  icon: {
    paddingRight: 0
  }
});

const renderQRCode = (base64: string) =>
  fromNullable(base64).fold(null, s => (
    <SvgXml xml={s} height={249} width={249} />
  ));

const bonusVacanzeImage = require("../../../../img/bonus/bonusVacanze/vacanze.png");

const QrModalBox: React.FunctionComponent<Props> = (props: Props) => {
  const { onClose, qrCode, secretCode } = props;
  useHardwareBackButton(() => {
    onClose();
    return true;
  });
  return (
    <View style={styles.modalBackdrop}>
      <View style={styles.modalBox}>
        <View style={styles.row}>
          <Text style={styles.title} semibold={true}>
            {I18n.t("bonus.bonusVacanza.name")}
          </Text>
          <Button
            style={styles.modalClose}
            onPress={onClose}
            transparent={true}
          >
            <IconFont
              name="io-close"
              color={customVariables.lightGray}
              style={styles.icon}
            />
          </Button>
        </View>
        <View spacer={true} large={true} />
        <View style={styles.row}>
          <View>
            <Text style={styles.uniqueCode}>Codice univoco</Text>
            <View style={styles.row}>
              <Text style={styles.codeText} bold={true}>
                {secretCode}
              </Text>
              <View hspacer={true} />
              <CopyButtonComponent textToCopy={secretCode.toString()} />
            </View>
          </View>
          <Image
            source={bonusVacanzeImage}
            resizeMode={"contain"}
            style={styles.bonusLogo}
          />
        </View>
        <View spacer={true} extralarge={true} />
        <View style={styles.image}>{renderQRCode(qrCode)}</View>
      </View>
    </View>
  );
};

export default QrModalBox;
