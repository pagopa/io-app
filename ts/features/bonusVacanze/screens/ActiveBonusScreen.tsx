import { fromNullable } from "fp-ts/lib/Option";
import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import Share from "react-native-share";
import { SvgXml } from "react-native-svg";
import { NavigationInjectedProps } from "react-navigation";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";
import ScreenContent from "../../../components/screens/ScreenContent";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import variables from "../../../theme/variables";
import { showToast } from "../../../utils/showToast";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../utils/stringBuilder";
import { BonusStatusEnum, BonusVacanze } from "../types/bonusVacanze";
import { validityInterval } from "../utils/bonus";

type QRCodeContents = {
  [key: string]: string;
};

type NavigationParams = Readonly<{
  bonus: BonusVacanze;
  validFrom?: Date;
  validTo?: Date;
}>;

const QR_CODE_MIME_TYPE = "svg+xml";

type Props = NavigationInjectedProps<NavigationParams>;

const styles = StyleSheet.create({
  image: {
    resizeMode: "contain",
    width: 300,
    height: 300,
    alignSelf: "center"
  },
  code: {
    alignSelf: "center"
  },
  rowBlock: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  paddedContent: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  },
  helpButton: {
    alignSelf: "center"
  }
});

const renderQRCode = (base64: string) =>
  fromNullable(base64).fold(null, s => (
    <SvgXml xml={s} height="100%" width="100%" />
  ));

const ActiveBonusScreen: React.FunctionComponent<Props> = (props: Props) => {
  const [qrCode, setQRCode] = React.useState<QRCodeContents>({});

  const bonus = props.navigation.getParam("bonus");
  const validFrom = props.navigation.getParam("validFrom");
  const validTo = props.navigation.getParam("validTo");
  const bonusValidityInterval = validityInterval(validFrom, validTo);
  const status =
    bonus.status === BonusStatusEnum.ACTIVE
      ? I18n.t("bonus.active")
      : I18n.t("bonus.inactive");
  const renderRow = (key: string, value?: string) => {
    return fromNullable(value).fold(undefined, v => {
      return (
        <View style={styles.rowBlock}>
          <Text bold={true}>{key}</Text>
          <Text>{v}</Text>
        </View>
      );
    });
  };

  const shareQR = async (content: string, code: string) => {
    await Share.open({
      url: `data:image/png;base64,${content}`,
      message: `This is the code of your bonus: ${code}`
    }).catch(error => {
      if (error && JSON.stringify(error) !== JSON.stringify({})) {
        showToast(I18n.t("global.genericError"));
      }
    });
  };

  React.useEffect(() => {
    async function readBase64Svg() {
      return new Promise<QRCodeContents>((res, _) => {
        const qrCodes: BonusVacanze["qr_code"] = [...bonus.qr_code];
        const content = qrCodes.reduce<QRCodeContents>(
          (acc: QRCodeContents, curr: BonusVacanze["qr_code"][0]) => {
            if (curr.mime_type === QR_CODE_MIME_TYPE) {
              return {
                ...acc,
                [curr.mime_type]: Buffer.from(
                  curr.base64_content,
                  "base64"
                ).toString("ascii")
              };
            } else {
              return {
                ...acc,
                [curr.mime_type]: curr.base64_content
              };
            }
          },
          {}
        );
        res(content);
      });
    }
    readBase64Svg()
      .then(cc => setQRCode(cc))
      .catch(_ => undefined);
  }, []);

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("bonus.bonusVacanza.name")}
    >
      <ScreenContent title={I18n.t("bonus.active")}>
        <View style={styles.image}>
          {renderQRCode(qrCode[QR_CODE_MIME_TYPE])}
        </View>
        <Text style={styles.code}>{bonus.code}</Text>
        <ButtonDefaultOpacity
          style={styles.helpButton}
          transparent={true}
          onPress={() => shareQR(qrCode["image/png"], bonus.code)}
          activeOpacity={1}
        >
          <IconFont name="io-share" color={variables.brandPrimary} />
        </ButtonDefaultOpacity>

        <View spacer={true} />
        <View style={styles.paddedContent}>
          {renderRow(I18n.t("bonus.bonusVacanza.status"), status)}
          {renderRow(
            I18n.t("bonus.bonusVacanza.amount"),
            formatNumberAmount(centsToAmount(bonus.max_amount), true)
          )}
          {renderRow(
            I18n.t("bonus.bonusVacanza.taxBenefit"),
            formatNumberAmount(centsToAmount(bonus.max_tax_benefit), true)
          )}
          {renderRow(
            I18n.t("bonus.bonusVacanza.validity"),
            bonusValidityInterval
          )}
          <View spacer={true} />
          {renderRow(
            I18n.t("bonus.bonusVacanza.applicant"),
            bonus.applicant_fiscal_code
          )}
        </View>
        <EdgeBorderComponent />
      </ScreenContent>
    </BaseScreenComponent>
  );
};

export default ActiveBonusScreen;
