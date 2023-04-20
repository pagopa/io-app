import * as React from "react";
import { useContext } from "react";
import { View, Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import doubtImage from "../../../../../img/features/euCovidCert/certificate_not_found.png";
import CopyButtonComponent from "../../../../components/CopyButtonComponent";
import { HSpacer, VSpacer } from "../../../../components/core/spacer/Spacer";
import { H4 } from "../../../../components/core/typography/H4";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { mixpanelTrack } from "../../../../mixpanel";
import { GlobalState } from "../../../../store/reducers/types";
import { euCovidCertificateUrl } from "../../../../urls";
import { openWebUrl } from "../../../../utils/url";
import { confirmButtonProps } from "../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { EUCovidCertificateAuthCode } from "../../types/EUCovidCertificate";
import { BaseEuCovidCertificateLayout } from "../BaseEuCovidCertificateLayout";
import { EUCovidContext } from "../EuCovidCertificateRouterScreen";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

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

const EuCovidCertNotFoundKoComponent: React.FC<{
  currentAuthCode: EUCovidCertificateAuthCode;
  messageId: string;
}> = ({ currentAuthCode, messageId }) => (
  <>
    <InfoScreenComponent
      image={
        <Image
          source={doubtImage}
          importantForAccessibility={"no"}
          accessibilityElementsHidden={true}
          style={{ width: 104, height: 104, resizeMode: "contain" }}
          testID={"doubtImage"}
        />
      }
      title={I18n.t("features.euCovidCertificate.ko.notFound.title")}
    />
    <H4 weight={"Regular"}>
      {I18n.t("features.euCovidCertificate.ko.notFound.subtitle")}
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

const EuCovidCertNotFoundKoScreen = (_: Props): React.ReactElement => {
  const euCovidCertCurrent = useContext(EUCovidContext);
  // Handling unexpected error
  if (euCovidCertCurrent === null) {
    void mixpanelTrack("EUCOVIDCERT_UNEXPECTED_ERROR");
    return <WorkunitGenericFailure />;
  }

  return (
    <BaseEuCovidCertificateLayout
      testID={"EuCovidCertNotFoundKoScreen"}
      content={
        <EuCovidCertNotFoundKoComponent
          currentAuthCode={euCovidCertCurrent.authCode}
          messageId={euCovidCertCurrent.messageId}
        />
      }
      footer={
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={confirmButtonProps(
            () => openWebUrl(euCovidCertificateUrl),
            I18n.t("features.euCovidCertificate.ko.notFound.cta")
          )}
        />
      }
    />
  );
};
const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EuCovidCertNotFoundKoScreen);
