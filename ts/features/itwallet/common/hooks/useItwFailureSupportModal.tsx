import React from "react";
import { Linking, View } from "react-native";
import { Errors } from "@pagopa/io-react-native-wallet";
import {
  Divider,
  ListItemAction,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import {
  assistanceToolRemoteConfig,
  resetCustomFields,
  addTicketCustomField,
  zendeskItWalletFailureCode,
  zendeskItWalletCategory,
  logId,
  zendeskCategoryId
} from "../../../../utils/supportAssistance";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../zendesk/store/actions";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { IssuanceFailure } from "../../machine/eid/failure";
import { CredentialIssuanceFailure } from "../../machine/credential/failure";

const { isWalletProviderResponseError, isIssuerResponseError } = Errors;

type Params = {
  failure: IssuanceFailure | CredentialIssuanceFailure;
};

type ItwFailureSupportModal = (params: Params) => {
  bottomSheet: JSX.Element;
  present: () => void;
};

const extractErrorCode = (failure: Params["failure"]) => {
  const rawError = failure.reason;
  return isWalletProviderResponseError(rawError) ||
    isIssuerResponseError(rawError)
    ? rawError.code ?? failure.type
    : failure.type;
};

export const useItwFailureSupportModal: ItwFailureSupportModal = ({
  failure
}) => {
  const dispatch = useIODispatch();

  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);
  const code = extractErrorCode(failure);

  const zendeskAssistanceLogAndStart = () => {
    resetCustomFields();
    addTicketCustomField(zendeskCategoryId, zendeskItWalletCategory.value);
    addTicketCustomField(zendeskItWalletFailureCode, code);
    addTicketCustomField(logId, JSON.stringify(failure));
    dispatch(
      zendeskSupportStart({
        startingRoute: "n/a",
        assistanceType: {
          itWallet: true,
          payment: false,
          card: false,
          fci: false
        }
      })
    );
    dispatch(zendeskSelectedCategory(zendeskItWalletCategory));
  };

  const handleAskAssistance = () => {
    switch (choosenTool) {
      case ToolEnum.zendesk:
        zendeskAssistanceLogAndStart();
        break;
    }
  };

  const { bottomSheet, present, dismiss } = useIOBottomSheetAutoresizableModal({
    title: "",
    component: (
      <VStack space={24}>
        <View>
          <ListItemHeader
            label={I18n.t("features.itWallet.support.supportTitle")}
          />
          <ListItemAction
            variant="primary"
            icon="phone"
            label="Chiama 06.12.12.12"
            onPress={() => Linking.openURL(`tel:100.12.12.12`)}
          />
          <Divider />
          <ListItemAction
            variant="primary"
            icon="chat"
            label={I18n.t("features.itWallet.support.chat")}
            onPress={() => {
              dismiss();
              handleAskAssistance();
            }}
          />
          <Divider />
          <ListItemInfo
            icon="phone"
            label={I18n.t("features.itWallet.support.landline")}
            value="800.232323"
          />
        </View>

        {code && (
          <View>
            <ListItemHeader
              label={I18n.t("features.itWallet.support.additionalDataTitle")}
            />
            <ListItemInfoCopy
              icon="ladybug"
              label={I18n.t("features.itWallet.support.errorCode")}
              value={code}
              onPress={() => clipboardSetStringWithFeedback(code)}
            />
            <VSpacer size={24} />
          </View>
        )}
      </VStack>
    )
  });

  return { bottomSheet, present };
};
