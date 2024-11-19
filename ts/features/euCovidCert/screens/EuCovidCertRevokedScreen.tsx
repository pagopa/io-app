import {
  Body,
  Divider,
  H3,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import { localeDateFormat } from "../../../utils/locale";
import { getPaginatedMessageById } from "../../messages/store/reducers/paginatedById";
import { EuCovidCertHeader } from "../components/EuCovidCertHeader";
import { EuCovidCertLearnMoreLink } from "../components/EuCovidCertLearnMoreLink";
import { EUCovidContext } from "../components/EUCovidContext";
import { MarkdownHandleCustomLink } from "../components/MarkdownHandleCustomLink";
import { WithEUCovidCertificateHeaderData } from "../types/EUCovidCertificate";
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
  const paginatedMessagePot = useIOSelector(state =>
    getPaginatedMessageById(state, messageId)
  );
  const createdAtOrUndefined = pot.toUndefined(paginatedMessagePot)?.createdAt;

  return (
    <>
      <VSpacer size={8} />
      {createdAtOrUndefined && (
        <Body weight="Semibold">
          {localeDateFormat(
            createdAtOrUndefined,
            I18n.t("global.dateFormats.fullFormatShortMonthLiteralWithTime")
          )}
        </Body>
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
