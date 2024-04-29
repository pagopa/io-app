import { VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Image } from "react-native";
import revokedImage from "../../../../img/features/euCovidCert/certificate_revoked.png";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../i18n";
import { EuCovidCertHeader } from "../components/EuCovidCertHeader";
import EuCovidCertLearnMoreLink from "../components/EuCovidCertLearnMoreLink";
import { MarkdownHandleCustomLink } from "../components/MarkdownHandleCustomLink";
import { WithEUCovidCertificateHeaderData } from "../types/EUCovidCertificate";
import { BaseEuCovidCertificateLayout } from "./BaseEuCovidCertificateLayout";

type Props = {
  revokeInfo?: string;
} & WithEUCovidCertificateHeaderData;

const EuCovidCertRevokedContentComponent = (props: Props) => (
  <>
    <VSpacer size={40} />
    <VSpacer size={40} />
    <InfoScreenComponent
      image={
        <Image
          accessibilityIgnoresInvertColors
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

export const EuCovidCertRevokedScreen = (props: Props): React.ReactElement => (
  <BaseEuCovidCertificateLayout
    testID={"EuCovidCertRevokedScreen"}
    header={<EuCovidCertHeader {...props} />}
    content={<EuCovidCertRevokedContentComponent {...props} />}
  />
);
