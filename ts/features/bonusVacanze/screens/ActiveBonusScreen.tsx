import { fromNullable } from "fp-ts/lib/Option";
import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import { NavigationInjectedProps } from "react-navigation";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";
import ScreenContent from "../../../components/screens/ScreenContent";
import I18n from "../../../i18n";
import variables from "../../../theme/variables";
import { formatDateAsLocal } from "../../../utils/dates";
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

  React.useEffect(() => {
    // tslint:disable-next-line:no-floating-promises
    new Promise<QRCodeContents>((res, _) => {
      const qrCodes: BonusVacanze["qr_code"] = [...bonus.qr_code];
      const content = qrCodes.reduce<QRCodeContents>(
        (acc: QRCodeContents, curr: BonusVacanze["qr_code"][0]) => {
          return {
            ...acc,
            [curr.mime_type]: Buffer.from(
              curr.base64_content,
              "base64"
            ).toString("ascii")
          };
        },
        {}
      );
      res(content);
    }).then(content => {
      setQRCode(content);
    });
  }, []);

  const bonusValidityInterval = validityInterval(validFrom, validTo);

  const status =
    bonus.status === BonusStatusEnum.ACTIVE
      ? I18n.t("bonus.active")
      : I18n.t("bonus.inactive");

  return (
    <BaseScreenComponent goBack={true} headerTitle="Bonus Vacanze">
      <ScreenContent
        title={I18n.t("bonus.latestBonus")}
        subtitle={`${status} ${formatDateAsLocal(bonus.updated_at, true)}`}
      >
        <View style={styles.image}>
          {renderQRCode(qrCode[QR_CODE_MIME_TYPE])}
        </View>
        <Text style={styles.code}>{bonus.code}</Text>
        <View spacer={true} />
        <View style={styles.paddedContent}>
          <View style={styles.rowBlock}>
            <Text bold={true}>{I18n.t("wallet.amount")}</Text>
            <Text>
              {formatNumberAmount(centsToAmount(bonus.max_amount), true)}
            </Text>
          </View>
          <View style={styles.rowBlock}>
            <Text bold={true}>{I18n.t("bonus.bonusVacanza.taxBenefit")}</Text>
            <Text>
              {formatNumberAmount(centsToAmount(bonus.max_tax_benefit))}
            </Text>
          </View>
          <View style={styles.rowBlock}>
            <Text bold={true}>{I18n.t("bonus.bonusVacanza.validity")}</Text>
            <Text>{bonusValidityInterval}</Text>
          </View>
          <View spacer={true} />
          <View style={styles.rowBlock}>
            <Text bold={true}>{I18n.t("bonus.bonusVacanza.applicant")}</Text>
            <Text>{bonus.applicant_fiscal_code}</Text>
          </View>
        </View>
        <EdgeBorderComponent />
      </ScreenContent>
    </BaseScreenComponent>
  );
};

export default ActiveBonusScreen;
