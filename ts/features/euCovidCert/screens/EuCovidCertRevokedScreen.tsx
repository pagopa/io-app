import {
  Divider,
  H3,
  LabelSmall,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../i18n";
import { EuCovidCertHeader } from "../components/EuCovidCertHeader";
import { EuCovidCertLearnMoreLink } from "../components/EuCovidCertLearnMoreLink";
import { MarkdownHandleCustomLink } from "../components/MarkdownHandleCustomLink";
import { WithEUCovidCertificateHeaderData } from "../types/EUCovidCertificate";
import { useIOSelector } from "../../../store/hooks";
import { EUCovidContext } from "../components/EUCovidContext";
import { getPaginatedMessageCreatedAt } from "../../messages/store/reducers/paginatedById";
import { localeDateFormat } from "../../../utils/locale";
import { serviceByIdSelector } from "../../services/details/store/reducers/servicesById";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { OrganizationHeader } from "../../messages/components/MessageDetail/OrganizationHeader";
import { isStringNullyOrEmpty } from "../../../utils/strings";
import { BaseEuCovidCertificateLayout } from "./BaseEuCovidCertificateLayout";

const styles = StyleSheet.create({
  container: {
    alignItems: "center"
  },
  title: {
    textAlign: "center"
  }
});

type Props = {
  revokeInfo?: string;
} & WithEUCovidCertificateHeaderData;

const EuCovidCertRevokedContentComponent = (props: Props) => {
  const currentCert = React.useContext(EUCovidContext);
  const messageId = currentCert?.messageId ?? "";
  const createdAt = useIOSelector(state =>
    getPaginatedMessageCreatedAt(state, messageId)
  );
  const serviceId = (currentCert?.serviceId ?? "") as ServiceId;
  const service = useIOSelector(state => serviceByIdSelector(state, serviceId));

  const logoUriOrUndefined = !isStringNullyOrEmpty(props.headerData.logoUrl)
    ? [{ uri: props.headerData.logoUrl }]
    : undefined;

  return (
    <>
      <VSpacer size={8} />
      {createdAt && (
        <LabelSmall fontSize="regular" color="grey-700">
          {localeDateFormat(
            createdAt,
            I18n.t("global.dateFormats.fullFormatShortMonthLiteralWithTime")
          )}
        </LabelSmall>
      )}
      <VSpacer size={8} />
      <Divider />
      {service && (
        <>
          <OrganizationHeader
            logoUri={logoUriOrUndefined}
            organizationName={service.organization_name}
            serviceName={service.service_name}
          />
          <Divider />
        </>
      )}
      <VSpacer size={32} />
      <View style={styles.container}>
        <Pictogram name="accessDenied" />
        <H3 style={styles.title}>
          {I18n.t("features.euCovidCertificate.revoked.title")}
        </H3>
      </View>
      <VSpacer size={16} />
      {props.revokeInfo && (
        <MarkdownHandleCustomLink>{props.revokeInfo}</MarkdownHandleCustomLink>
      )}
      <VSpacer size={32} />
      <EuCovidCertLearnMoreLink />
    </>
  );
};

export const EuCovidCertRevokedScreen = (props: Props): React.ReactElement => {
  const noLogoHeaderProps: WithEUCovidCertificateHeaderData = {
    ...props,
    headerData: {
      ...props.headerData,
      logoUrl: ""
    }
  };
  return (
    <BaseEuCovidCertificateLayout
      testID={"EuCovidCertRevokedScreen"}
      header={<EuCovidCertHeader {...noLogoHeaderProps} />}
      content={<EuCovidCertRevokedContentComponent {...props} />}
    />
  );
};
