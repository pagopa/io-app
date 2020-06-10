import { fromNullable } from "fp-ts/lib/Option";
import { Badge, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import { NavigationInjectedProps } from "react-navigation";
import { BonusActivationWithQrCode } from "../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";
import ScreenContent from "../../../components/screens/ScreenContent";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import variables from "../../../theme/variables";
import { shareBase64Content } from "../../../utils/share";
import { showToast } from "../../../utils/showToast";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../utils/stringBuilder";
import { validityInterval } from "../utils/bonus";

type QRCodeContents = {
  [key: string]: string;
};

type NavigationParams = Readonly<{
  bonus: BonusActivationWithQrCode;
  validFrom?: Date;
  validTo?: Date;
}>;

const QR_CODE_MIME_TYPE = "svg+xml";
const PNG_IMAGE_TYPE = "image/png";

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
  },
  statusBadge: {
    height: 18,
    marginTop: 2,
    backgroundColor: variables.brandHighLighter
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16
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
    const shared = await shareBase64Content(content, code).run();
    if (shared.isLeft()) {
      showToast(I18n.t("global.genericError"));
    }
  };

  React.useEffect(() => {
    async function readBase64Svg(bonusWithQrCode: BonusActivationWithQrCode) {
      return new Promise<QRCodeContents>((res, _) => {
        const qrCodes: BonusActivationWithQrCode["qr_code"] = [
          ...bonusWithQrCode.qr_code
        ];
        const content = qrCodes.reduce<QRCodeContents>(
          (
            acc: QRCodeContents,
            curr: BonusActivationWithQrCode["qr_code"][0]
          ) => {
            // for svg we need to convert base64 content to ascii to be rendered
            if (curr.mime_type === QR_CODE_MIME_TYPE) {
              return {
                ...acc,
                [curr.mime_type]: Buffer.from(curr.content, "base64").toString(
                  "ascii"
                )
              };
            } else {
              return {
                ...acc,
                [curr.mime_type]: curr.content
              };
            }
          },
          {}
        );
        res(content);
      });
    }
    readBase64Svg(bonus)
      .then(cc => setQRCode(cc))
      .catch(_ => undefined);
  }, []);

  const bonusStatusDescription = I18n.t(`bonus.${bonus.status.toLowerCase()}`, {
    defaultValue: ""
  });
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("bonus.bonusVacanza.name")}
    >
      <ScreenContent>
        <View style={styles.image}>
          {renderQRCode(qrCode[QR_CODE_MIME_TYPE])}
        </View>
        <Text style={styles.code}>{bonus.code}</Text>
        <ButtonDefaultOpacity
          style={styles.helpButton}
          transparent={true}
          onPress={() =>
            shareQR(
              qrCode[PNG_IMAGE_TYPE],
              `${I18n.t("bonus.bonusVacanza.shareMessage")} ${bonus.code}`
            )
          }
          activeOpacity={1}
        >
          <IconFont name="io-share" color={variables.brandPrimary} />
        </ButtonDefaultOpacity>

        <View spacer={true} />
        <View style={styles.paddedContent}>
          {bonusStatusDescription.length > 0 && (
            <View style={styles.rowBlock}>
              <Text bold={true}>{I18n.t("bonus.bonusVacanza.status")}</Text>
              <Badge style={styles.statusBadge}>
                <Text style={styles.statusText}>{bonusStatusDescription}</Text>
              </Badge>
            </View>
          )}
          {renderRow(
            I18n.t("bonus.bonusVacanza.amount"),
            formatNumberAmount(
              centsToAmount(bonus.dsu_request.max_amount),
              true
            )
          )}
          {renderRow(
            I18n.t("bonus.bonusVacanza.taxBenefit"),
            formatNumberAmount(
              centsToAmount(bonus.dsu_request.max_tax_benefit),
              true
            )
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
