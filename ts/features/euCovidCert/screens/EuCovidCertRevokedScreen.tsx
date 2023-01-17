import * as React from "react";
import { Image } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import revokedImage from "../../../../img/features/euCovidCert/certificate_revoked.png";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../i18n";
import { GlobalState } from "../../../store/reducers/types";
import EuCovidCertLearnMoreLink from "../components/EuCovidCertLearnMoreLink";
import { MarkdownHandleCustomLink } from "../components/MarkdownHandleCustomLink";
import { WithEUCovidCertificateHeaderData } from "../types/EUCovidCertificate";
import { EuCovidCertHeader } from "../components/EuCovidCertHeader";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { BaseEuCovidCertificateLayout } from "./BaseEuCovidCertificateLayout";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> & {
    revokeInfo?: string;
  } & WithEUCovidCertificateHeaderData;

const EuCovidCertRevokedContentComponent = (props: Props) => (
  <>
    <VSpacer size={40} />
    <VSpacer size={40} />
    <InfoScreenComponent
      image={
        <Image
          source={revokedImage}
          importantForAccessibility={"no"}
          accessibilityElementsHidden={true}
          style={{ width: 104, height: 104, resizeMode: "contain" }}
        />
      }
      title={I18n.t("features.euCovidCertificate.revoked.title")}
      body={<EuCovidCertLearnMoreLink />}
    />
    <VSpacer size={16} />
    {props.revokeInfo && (
      <MarkdownHandleCustomLink extraBodyHeight={60}>
        {props.revokeInfo}
      </MarkdownHandleCustomLink>
    )}
  </>
);

const EuCovidCertRevokedScreen = (props: Props): React.ReactElement => (
  <BaseEuCovidCertificateLayout
    testID={"EuCovidCertRevokedScreen"}
    header={<EuCovidCertHeader {...props} />}
    content={<EuCovidCertRevokedContentComponent {...props} />}
  />
);

const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EuCovidCertRevokedScreen);
