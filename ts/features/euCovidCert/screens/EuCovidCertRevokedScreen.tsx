import {
  Divider,
  H3,
  Label,
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

  return (
    <>
      <VSpacer size={8} />
      {createdAt && (
        <Label color="grey-700">
          {localeDateFormat(
            createdAt,
            I18n.t("global.dateFormats.fullFormatShortMonthLiteralWithTime")
          )}
        </Label>
      )}
      <VSpacer size={8} />
      <Divider />
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

export const EuCovidCertRevokedScreen = (props: Props): React.ReactElement => (
  <BaseEuCovidCertificateLayout
    testID={"EuCovidCertRevokedScreen"}
    header={<EuCovidCertHeader {...props} />}
    content={<EuCovidCertRevokedContentComponent {...props} />}
  />
);
