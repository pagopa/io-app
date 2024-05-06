import { HSpacer, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { useContext } from "react";
import { Image, StyleSheet, View } from "react-native";
import wrongFormatImage from "../../../../../img/features/euCovidCert/certificate_wrong_format.png";
import CopyButtonComponent from "../../../../components/CopyButtonComponent";
import { H4 } from "../../../../components/core/typography/H4";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../../i18n";
import { mixpanelTrack } from "../../../../mixpanel";
import { euCovidCertificateUrl } from "../../../../urls";
import { openWebUrl } from "../../../../utils/url";
import { EUCovidCertificateAuthCode } from "../../types/EUCovidCertificate";
import {
  BaseEuCovidCertificateLayout,
  BaseSingleButtonFooter
} from "../BaseEuCovidCertificateLayout";
import { EUCovidContext } from "../../components/EUCovidContext";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  shrink: {
    flexShrink: 1
  }
});

const CopyWithTitleItem: React.FC<{
  title: string;
  toCopy: string;
  testId?: string;
}> = ({ title, toCopy, testId }) => (
  <>
    <View>
      <H4 weight={"Regular"}>{title}</H4>
    </View>
    <View style={styles.row}>
      <H4 weight={"Bold"} testID={`${testId}ToCopy`} style={styles.shrink}>
        {toCopy}
      </H4>
      <HSpacer size={16} />
      <CopyButtonComponent textToCopy={toCopy} />
    </View>
  </>
);

const EuCovidCertWrongFormatKoComponent: React.FC<{
  currentAuthCode: EUCovidCertificateAuthCode;
  messageId: string;
}> = ({ currentAuthCode, messageId }) => (
  <>
    <InfoScreenComponent
      image={
        <Image
          accessibilityIgnoresInvertColors
          source={wrongFormatImage}
          importantForAccessibility={"no"}
          accessibilityElementsHidden={true}
          style={{ width: 104, height: 104, resizeMode: "contain" }}
          testID={"doubtImage"}
        />
      }
      title={I18n.t("features.euCovidCertificate.ko.wrongFormat.title")}
    />
    <H4 weight={"Regular"}>
      {I18n.t("features.euCovidCertificate.ko.wrongFormat.subtitle")}
    </H4>
    <VSpacer size={16} />
    <CopyWithTitleItem
      title={I18n.t("features.euCovidCertificate.common.authorizationCode")}
      toCopy={currentAuthCode}
      testId={"authorizationCode"}
    />
    <VSpacer size={16} />
    <CopyWithTitleItem
      title={I18n.t("features.euCovidCertificate.common.messageIdentifier")}
      toCopy={messageId}
      testId={"messageIdentifier"}
    />
  </>
);

export const EuCovidCertWrongFormatKoScreen = (): React.ReactElement => {
  const euCovidCertCurrent = useContext(EUCovidContext);

  // Handling unexpected error
  if (euCovidCertCurrent === null) {
    void mixpanelTrack("EUCOVIDCERT_UNEXPECTED_ERROR");
    return <WorkunitGenericFailure />;
  }

  return (
    <BaseEuCovidCertificateLayout
      testID={"EuCovidCertWrongFormatKoScreen"}
      content={
        <EuCovidCertWrongFormatKoComponent
          currentAuthCode={euCovidCertCurrent.authCode}
          messageId={euCovidCertCurrent.messageId}
        />
      }
      footer={
        <BaseSingleButtonFooter
          onPress={() => openWebUrl(euCovidCertificateUrl)}
          title={I18n.t("features.euCovidCertificate.ko.wrongFormat.cta")}
        />
      }
    />
  );
};
