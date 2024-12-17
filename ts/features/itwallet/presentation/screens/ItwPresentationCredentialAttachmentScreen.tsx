import { IOColors, IOStyles, useIOToast } from "@pagopa/io-app-design-system";
import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Pdf from "react-native-pdf";
import Share from "react-native-share";
import { useFocusEffect } from "@react-navigation/native";
import {
  FooterActions,
  FooterActionsMeasurements
} from "../../../../components/ui/FooterActions";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";
import {
  getClaimsFullLocale,
  PdfClaim
} from "../../common/utils/itwClaimsUtils";
import { ParsedCredential } from "../../common/utils/itwTypesUtils";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { trackWalletCredentialFAC_SIMILE } from "../../analytics";

// We currently only support PDF files, extend this if needed
type SupportedAttachmentType = "application/pdf";

export type ItwPresentationCredentialAttachmentNavigationParams = {
  attachmentClaim: ParsedCredential[string];
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_ATTACHMENT"
>;

type AttachmentData = {
  fileName: string;
  type: SupportedAttachmentType;
  uri: string;
};

export const ItwPresentationCredentialAttachmentScreen = ({
  route
}: ScreenProps) => {
  const toast = useIOToast();

  const [footerActionsMeasurements, setfooterActionsMeasurements] =
    useState<FooterActionsMeasurements>({
      actionBlockHeight: 0,
      safeBottomAreaHeight: 0
    });

  useFocusEffect(trackWalletCredentialFAC_SIMILE);

  useHeaderSecondLevel({
    title: "",
    canGoBack: true,
    supportRequest: true
  });

  const handleOnShare =
    ({ fileName, uri, type }: AttachmentData) =>
    async () => {
      try {
        await Share.open({
          activityItemSources: [],
          filename: getFileNameWithExtension(fileName, type),
          type,
          url: uri,
          failOnCancel: false
        });
      } catch (err) {
        toast.show(I18n.t("messagePDFPreview.errors.sharing"));
      }
    };

  const handleFooterActionsMeasurements = (
    values: FooterActionsMeasurements
  ) => {
    setfooterActionsMeasurements(values);
  };

  const attachmentData = getAttachmentData(route.params.attachmentClaim);

  if (attachmentData === undefined) {
    // The attachment claim is not supported or containes invalid data
    return <ItwGenericErrorContent />;
  }

  return (
    <View
      style={[
        IOStyles.flex,
        {
          paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
        }
      ]}
    >
      <Pdf
        enablePaging
        fitPolicy={0}
        style={styles.pdfContainer}
        source={{
          uri: attachmentData.uri,
          cache: true
        }}
      />
      <FooterActions
        onMeasure={handleFooterActionsMeasurements}
        actions={{
          type: "SingleButton",
          primary: {
            label: I18n.t("features.itWallet.presentation.ctas.shareButton"),
            onPress: handleOnShare(attachmentData)
          }
        }}
      />
    </View>
  );
};

/**
 * Given the attachment claim, return the data needed to display the attachment
 */
const getAttachmentData = ({
  name,
  value
}: ParsedCredential[string]): AttachmentData | undefined => {
  const fileName =
    typeof name === "string" ? name : name?.[getClaimsFullLocale()] || "";

  if (PdfClaim.is(value)) {
    return {
      fileName,
      uri: value,
      type: "application/pdf"
    };
  }

  return undefined;
};

/**
 * Given the filename and the type of the attachment, returns the filename with the extension.
 * On Android the extension is added automatically by the OS and iOS we need to add it manually
 */
const getFileNameWithExtension = (
  fileName: string,
  type: SupportedAttachmentType
) => {
  const extension = type.split("/")[1];
  const fileNameWithoutExtension = /^[^.]+/.exec(fileName)?.[0];

  return Platform.OS === "ios"
    ? `${fileNameWithoutExtension}.${extension}`
    : fileNameWithoutExtension;
};

const styles = StyleSheet.create({
  pdfContainer: {
    flexGrow: 1,
    backgroundColor: IOColors["grey-700"]
  }
});
