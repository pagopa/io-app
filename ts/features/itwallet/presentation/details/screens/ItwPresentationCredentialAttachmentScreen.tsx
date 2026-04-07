import {
  FooterActions,
  FooterActionsMeasurements,
  IOColors,
  useIOToast
} from "@pagopa/io-app-design-system";
import { useCallback, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Pdf from "react-native-pdf";
import Share from "react-native-share";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel.tsx";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList.ts";
import { ItwGenericErrorContent } from "../../../common/components/ItwGenericErrorContent.tsx";
import {
  getClaimsFullLocale,
  PdfClaim
} from "../../../common/utils/itwClaimsUtils.ts";
import { ParsedCredential } from "../../../common/utils/itwTypesUtils.ts";
import { ItwParamsList } from "../../../navigation/ItwParamsList.ts";
import { trackWalletCredentialFAC_SIMILE } from "../analytics";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture.ts";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { useIOSelector } from "../../../../../store/hooks";

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
  const isL3Credential = useIOSelector(itwLifecycleIsITWalletValidSelector);

  const [footerActionsMeasurements, setfooterActionsMeasurements] =
    useState<FooterActionsMeasurements>({
      actionBlockHeight: 0,
      safeBottomAreaHeight: 0
    });

  usePreventScreenCapture();
  useFocusEffect(
    useCallback(
      () =>
        trackWalletCredentialFAC_SIMILE(
          isL3Credential ? "ITW_TS_V3" : "ITW_TS_V2"
        ),
      [isL3Credential]
    )
  );

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
      style={{
        flex: 1,
        paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
      }}
    >
      {/** Be aware that, in react-native-pdf 6.7.7, on Android, there
       * is a bug where onLoadComplete callback is not called. So,
       * if you have to use such callback, you should rely upon
       * onPageChanged, which is called to report that the first page
       * has loaded */}
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
    // TODO: Dark mode: Replace with theme values
    backgroundColor: IOColors["grey-700"]
  }
});
