import {
  Divider,
  ListItemAction,
  ListItemHeader,
  ListItemInfoCopy,
  useIOToast,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../utils/url";
import { CredentialIssuanceFailure } from "../../machine/credential/failure";
import { IssuanceFailure } from "../../machine/eid/failure";
import { extractItwFailureCode } from "../utils/itwFailureUtils";
import {
  useItwZendeskSupport,
  ZendeskSubcategoryValue
} from "./useItwZendeskSupport";

export const ITW_ISSUER_DYNAMIC_ERROR_HELP_CENTER_URL =
  "https://assistenza.ioapp.it/hc/it/articles/40032473652881-Continuare-a-usare-Documenti-su-IO-senza-limitazioni-dopo-12-mesi";

type Failure = CredentialIssuanceFailure | IssuanceFailure;

/**
 * Input required to configure the issuer dynamic error bottom sheet.
 * `failure` is used both to derive the support error code and to provide
 * additional troubleshooting data to Zendesk.
 */
type Props = {
  failure: Failure;
  zendeskSubcategory: ZendeskSubcategoryValue;
};

/**
 * Builds the support bottom sheet shown for issuer-side dynamic failures.
 * It gives the user two recovery paths:
 * - open the dedicated Help Center article
 * - start a Zendesk conversation
 * The sheet also shows the error code with a copy-to-clipboard action to facilitate support interactions.
 * @param failure - The failure object from which the error code is extracted and sent to Zendesk.
 * @param zendeskSubcategory - The Zendesk subcategory to be used when starting a support conversation.
 * @returns An object containing the bottom sheet component and functions to present and dismiss it.
 */
export const useItwIssuerDynamicErrorBottomSheet = ({
  failure,
  zendeskSubcategory
}: Props) => {
  const toast = useIOToast();
  const { startItwZendeskSupport } = useItwZendeskSupport();
  const errorCode = extractItwFailureCode(failure);

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    title: I18n.t("features.itWallet.support.supportTitle"),
    component: (
      <VStack space={24}>
        <View>
          <ListItemAction
            testID="contact-method-help-center"
            variant="primary"
            icon="website"
            label={I18n.t("features.itWallet.support.helpCenter")}
            onPress={() =>
              openWebUrl(ITW_ISSUER_DYNAMIC_ERROR_HELP_CENTER_URL, () =>
                toast.error(I18n.t("global.jserror.title"))
              )
            }
          />
          <Divider />
          <ListItemAction
            testID="contact-method-chat"
            variant="primary"
            icon="chat"
            label={I18n.t("features.itWallet.support.chat")}
            onPress={() => {
              dismiss();
              startItwZendeskSupport({
                subcategory: zendeskSubcategory,
                errorCode,
                logData: JSON.stringify(failure)
              });
            }}
          />
        </View>
        <View>
          <ListItemHeader
            label={I18n.t("features.itWallet.support.additionalDataTitle")}
          />
          <ListItemInfoCopy
            icon="ladybug"
            label={I18n.t("features.itWallet.support.errorCode")}
            accessibilityHint={I18n.t("clipboard.copyIntoClipboard")}
            value={errorCode}
            onPress={() => clipboardSetStringWithFeedback(errorCode)}
          />
          <VSpacer size={24} />
        </View>
      </VStack>
    )
  });

  return { bottomSheet, present, dismiss };
};
