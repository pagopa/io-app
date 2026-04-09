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

type Props = {
  failure: Failure;
  zendeskSubcategory: ZendeskSubcategoryValue;
};

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
