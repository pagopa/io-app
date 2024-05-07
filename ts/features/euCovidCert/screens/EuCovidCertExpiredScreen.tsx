import { VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Image } from "react-native";
import expiredImage from "../../../../img/features/euCovidCert/certificate_expired.png";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../i18n";
import { EuCovidCertHeader } from "../components/EuCovidCertHeader";
import { EuCovidCertLearnMoreLink } from "../components/EuCovidCertLearnMoreLink";
import { MarkdownHandleCustomLink } from "../components/MarkdownHandleCustomLink";
import { WithEUCovidCertificateHeaderData } from "../types/EUCovidCertificate";
import { BaseEuCovidCertificateLayout } from "./BaseEuCovidCertificateLayout";

type Props = {
  expiredInfo?: string;
} & WithEUCovidCertificateHeaderData;

const EuCovidCertExpiredContentComponent = (props: Props) => (
  <>
    <VSpacer size={40} />
    <VSpacer size={40} />
    <InfoScreenComponent
      image={
        <Image
          accessibilityIgnoresInvertColors
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
export const EuCovidCertExpiredScreen = (props: Props): React.ReactElement => (
  <BaseEuCovidCertificateLayout
    testID={"EuCovidCertExpiredScreen"}
    content={<EuCovidCertExpiredContentComponent {...props} />}
    header={<EuCovidCertHeader {...props} />}
  />
);
