import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { View, Image, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import CopyButtonComponent from "../../../../components/CopyButtonComponent";
import { HSpacer, VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H2 } from "../../../../components/core/typography/H2";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";

type Props = {
  qrCode: string;
  logo?: string;
  codeToCopy: string;
  codeToDisplay: string;
};

const styles = StyleSheet.create({
  modalBox: {
    height: "100%",
    alignSelf: "center",
    width: "100%",
    paddingTop: 16
  },
  image: {
    height: 249,
    width: 249,
    alignSelf: "center"
  },
  bonusLogo: {
    height: 48,
    width: 48
  }
});

const renderQRCode = (base64: string) =>
  pipe(
    base64,
    O.fromNullable,
    O.fold(
      () => null,
      s => <SvgXml xml={s} height={249} width={249} />
    )
  );

const QrModalBox: React.FunctionComponent<Props> = (props: Props) => {
  const { qrCode, codeToDisplay, codeToCopy } = props;

  return (
    <View style={styles.modalBox}>
      <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
        <View>
          <Body>{I18n.t("bonus.bonusVacanze.uniqueCode")}</Body>
          <VSpacer size={4} />
          <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
            <H2 color="blue">{codeToDisplay}</H2>
            <HSpacer size={16} />
            <CopyButtonComponent
              textToCopy={codeToCopy}
              onPressWithGestureHandler={true}
            />
          </View>
        </View>
        {props.logo && (
          <Image
            source={{ uri: props.logo }}
            resizeMode={"contain"}
            style={styles.bonusLogo}
          />
        )}
      </View>
      <VSpacer size={40} />
      <View style={styles.image}>{renderQRCode(qrCode)}</View>
    </View>
  );
};

export default QrModalBox;
