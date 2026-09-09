import {
  FooterActions,
  FooterActionsMeasurements,
  IOColors,
  useIOToast
} from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import * as Sharing from "expo-sharing";
import I18n from "i18next";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import RNFS from "react-native-fs";
import Pdf from "react-native-pdf";

import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel.tsx";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../../store/hooks";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture.ts";
import { ItwGenericErrorContent } from "../../../common/components/ItwGenericErrorContent.tsx";
import {
  getClaimsFullLocale,
  isPdfClaim
} from "../../../common/utils/itwClaimsUtils.ts";
import { ParsedCredential } from "../../../common/utils/itwTypesUtils.ts";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList.ts";
import { trackWalletCredentialFAC_SIMILE } from "../analytics";

export type ItwPresentationCredentialAttachmentNavigationParams = {
  attachmentClaim: ParsedCredential[string];
};

type AttachmentData = {
  fileName: string;
  type: SupportedAttachmentType;
  uri: string;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_ATTACHMENT"
>;

// We currently only support PDF files, extend this if needed
type SupportedAttachmentType = "application/pdf";

const PDF_DATA_URI_PREFIX = "data:application/pdf;base64,";
const FALLBACK_ATTACHMENT_FILE_NAME = "attachment";
const FILE_NAME_EXTENSION_REGEX = /\.pdf$/i;
const PATH_SEPARATOR_REGEX = /[/\\]/g;
const LEADING_FILE_NAME_CHARS_REGEX = /^[\s.]+/;
const NULL_CHARACTER = "\u0000";

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
      const fileNameWithExtension = getFileNameWithExtension(fileName, type);
      const tempPath = `${RNFS.CachesDirectoryPath}/${fileNameWithExtension}`;

      try {
        await RNFS.writeFile(
          tempPath,
          uri.replace(PDF_DATA_URI_PREFIX, ""),
          "base64"
        );
        await Sharing.shareAsync(`file://${tempPath}`, {
          mimeType: type,
          dialogTitle: fileNameWithExtension
        });
      } catch {
        toast.show(I18n.t("messagePDFPreview.errors.sharing"));
      } finally {
        try {
          const exists = await RNFS.exists(tempPath);
          if (exists) {
            await RNFS.unlink(tempPath);
          }
        } catch {
          // Best-effort cleanup of a temporary cache file.
        }
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
        source={{
          uri: attachmentData.uri,
          cache: true
        }}
        style={styles.pdfContainer}
      />
      <FooterActions
        actions={{
          type: "SingleButton",
          primary: {
            label: I18n.t("features.itWallet.presentation.ctas.shareButton"),
            onPress: () => void handleOnShare(attachmentData)()
          }
        }}
        onMeasure={handleFooterActionsMeasurements}
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

  if (typeof value === "string" && isPdfClaim(value)) {
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
 */
const getFileNameWithExtension = (
  fileName: string,
  type: SupportedAttachmentType
) => {
  const extension = type.split("/")[1];
  const sanitizedFileName = sanitizeFileName(
    fileName.replace(FILE_NAME_EXTENSION_REGEX, "")
  );
  const fileNameWithoutExtension =
    sanitizedFileName.length > 0
      ? sanitizedFileName
      : FALLBACK_ATTACHMENT_FILE_NAME;

  return `${fileNameWithoutExtension}.${extension}`;
};

const sanitizeFileName = (fileName: string) => {
  const withoutLeadingSpacesAndDots = fileName.replace(
    LEADING_FILE_NAME_CHARS_REGEX,
    ""
  );
  const withoutNullCharacters = withoutLeadingSpacesAndDots
    .split(NULL_CHARACTER)
    .join("");

  return withoutNullCharacters.replace(PATH_SEPARATOR_REGEX, "");
};

const styles = StyleSheet.create({
  pdfContainer: {
    flexGrow: 1,
    // TODO: Dark mode: Replace with theme values
    backgroundColor: IOColors["grey-700"]
  }
});
