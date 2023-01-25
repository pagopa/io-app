import * as React from "react";
import { Image } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import expiredImage from "../../../../img/features/euCovidCert/certificate_expired.png";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../i18n";
import { GlobalState } from "../../../store/reducers/types";
import EuCovidCertLearnMoreLink from "../components/EuCovidCertLearnMoreLink";
import { MarkdownHandleCustomLink } from "../components/MarkdownHandleCustomLink";
import { EuCovidCertHeader } from "../components/EuCovidCertHeader";
import { WithEUCovidCertificateHeaderData } from "../types/EUCovidCertificate";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { BaseEuCovidCertificateLayout } from "./BaseEuCovidCertificateLayout";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> & {
    expiredInfo?: string;
  } & WithEUCovidCertificateHeaderData;

const EuCovidCertExpiredContentComponent = (props: Props) => (
  <>
    <VSpacer size={40} />
    <VSpacer size={40} />
    <InfoScreenComponent
      image={
        <Image
          source={expiredImage}
          importantForAccessibility={"no"}
          accessibilityElementsHidden={true}
          style={{ width: 120, height: 118, resizeMode: "contain" }}
        />
      }
      title={I18n.t("features.euCovidCertificate.expired.title")}
      body={<EuCovidCertLearnMoreLink />}
    />
    <VSpacer size={16} />
    {props.expiredInfo && (
      <MarkdownHandleCustomLink extraBodyHeight={60}>
        {props.expiredInfo}
      </MarkdownHandleCustomLink>
    )}
  </>
);

/**
 * TODO: this screen is identical to EuCovidCertRevokedScreen but but it is still being finalized and could change a lot.
 * If it remains so, do a refactoring to unify common behaviors
 * @param props
 * @constructor
 */
const EuCovidCertExpiredScreen = (props: Props): React.ReactElement => (
  <BaseEuCovidCertificateLayout
    testID={"EuCovidCertExpiredScreen"}
    content={<EuCovidCertExpiredContentComponent {...props} />}
    header={<EuCovidCertHeader {...props} />}
  />
);

const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EuCovidCertExpiredScreen);
