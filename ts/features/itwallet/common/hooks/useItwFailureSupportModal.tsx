import { Fragment, JSX } from "react";
import { Linking, View } from "react-native";
import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import { Errors } from "@pagopa/io-react-native-wallet";
import {
  Body,
  Divider,
  ListItemAction,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import {
  assistanceToolRemoteConfig,
  resetCustomFields,
  addTicketCustomField,
  zendeskItWalletFailureCode,
  zendeskItWalletCategory,
  zendeskCategoryId,
  appendLog,
  resetLog
} from "../../../../utils/supportAssistance";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../zendesk/store/actions";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { IssuanceFailure } from "../../machine/eid/failure";
import { CredentialIssuanceFailure } from "../../machine/credential/failure";
import { ItwFailure } from "../utils/ItwFailureTypes.ts";
import { RemoteFailure } from "../../presentation/remote/machine/failure.ts";
import { isDefined } from "../../../../utils/guards.ts";

const { isWalletProviderResponseError, isIssuerResponseError } = Errors;

type SupportContactMethods = Partial<{
  email: string;
  mobile: string;
  landline: string;
  website: string;
}>;

export enum ZendeskSubcategoryValue {
  IT_WALLET_PRESENTAZIONE_REMOTA = "it_wallet_presentazione_remota",
  IT_WALLET_AGGIUNTA_DOCUMENTI = "it_wallet_aggiunta_documenti"
}

// The subcategory is fixed for now. In the future it can be made dynamic depending on the error type.
const ZENDESK_SUBCATEGORY_ID = "29326690756369";

const contactMethodsByCredentialType: Record<
  string,
  SupportContactMethods | undefined
> = {
  mDL: {
    mobile: "06.4577.5927",
    landline: "800.232323",
    email: "uco.dgmot@mit.gov.it"
  },
  EuropeanDisabilityCard: {
    website: "https://www.inps.it"
  },
  EuropeanHealthInsuranceCard: {
    mobile: "800.030.070"
  }
};

const extractErrorCode = (failure: Props["failure"]) => {
  const rawError = failure.reason;
  if (
    isWalletProviderResponseError(rawError) ||
    isIssuerResponseError(rawError)
  ) {
    return rawError.code ?? failure.type;
  }
  if (rawError instanceof Errors.IoWalletError) {
    return rawError.code;
  }
  if (rawError instanceof Error) {
    return rawError.message;
  }
  return failure.type;
};

type Props = {
  failure:
    | IssuanceFailure
    | CredentialIssuanceFailure
    | ItwFailure
    | RemoteFailure;
  credentialType?: string;
  supportChatEnabled: boolean;
  zendeskSubcategory: ZendeskSubcategoryValue;
};

/**
 * Hook that renders several support methods, with direct integration with Zendesk.
 */
export const useItwFailureSupportModal = ({
  failure,
  credentialType,
  supportChatEnabled,
  zendeskSubcategory
}: Props) => {
  const dispatch = useIODispatch();

  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);
  const code = extractErrorCode(failure);

  const zendeskAssistanceLogAndStart = () => {
    resetCustomFields();
    resetLog();

    addTicketCustomField(zendeskCategoryId, zendeskItWalletCategory.value);
    addTicketCustomField(ZENDESK_SUBCATEGORY_ID, zendeskSubcategory);
    addTicketCustomField(zendeskItWalletFailureCode, code);
    appendLog(JSON.stringify(failure));

    dispatch(
      zendeskSupportStart({
        startingRoute: "n/a",
        assistanceType: {
          itWallet: true
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

  const getContactMethods = (): Array<JSX.Element> => {
    if (supportChatEnabled) {
      return [
        <ListItemAction
          key="contact-method-chat"
          testID="contact-method-chat"
          variant="primary"
          icon="chat"
          label={I18n.t("features.itWallet.support.chat")}
          onPress={() => {
            dismiss();
            handleAskAssistance();
          }}
        />
      ];
    }

    const contactMethods = credentialType
      ? contactMethodsByCredentialType[credentialType]
      : undefined;

    if (!contactMethods) {
      return [];
    }

    return [
      pipe(
        O.fromNullable(contactMethods.mobile),
        O.fold(constNull, value => (
          <ListItemAction
            testID="contact-method-mobile"
            variant="primary"
            icon="phone"
            label={I18n.t("features.itWallet.support.phone", {
              phoneNumber: value
            })}
            onPress={() => Linking.openURL(`tel:${value}`)}
          />
        ))
      ),
      pipe(
        O.fromNullable(contactMethods.email),
        O.fold(constNull, value => (
          <ListItemAction
            testID="contact-method-email"
            variant="primary"
            icon="chat"
            label={I18n.t("features.itWallet.support.email")}
            onPress={() => Linking.openURL(`mailto:${value}`)}
          />
        ))
      ),
      pipe(
        O.fromNullable(contactMethods.website),
        O.fold(constNull, value => (
          <ListItemAction
            testID="contact-method-website"
            variant="primary"
            icon="website"
            label={I18n.t("features.itWallet.support.website")}
            onPress={() => Linking.openURL(value)}
          />
        ))
      ),
      pipe(
        O.fromNullable(contactMethods.landline),
        O.fold(constNull, value => (
          <ListItemInfo
            testID="contact-method-landline"
            icon="phone"
            label={I18n.t("features.itWallet.support.landline")}
            value={value}
          />
        ))
      )
    ]
      .filter(isDefined)
      .map((component, index, list) => (
        <Fragment key={`contact-method-${index}`}>
          {component}
          {index < list.length - 1 && <Divider />}
        </Fragment>
      ));
  };

  const contactMethods = getContactMethods();
  const hasContactMethods = contactMethods.length > 0;

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    title: "",
    component: (
      <VStack space={16}>
        <Body>{I18n.t("features.itWallet.support.supportDescription")}</Body>
        <VStack space={24}>
          {hasContactMethods && (
            <View>
              <ListItemHeader
                label={I18n.t("features.itWallet.support.supportTitle")}
              />
              {contactMethods}
            </View>
          )}
          {code && (
            <View>
              <ListItemHeader
                label={I18n.t("features.itWallet.support.additionalDataTitle")}
              />
              <ListItemInfoCopy
                icon="ladybug"
                label={I18n.t("features.itWallet.support.errorCode")}
                accessibilityLabel={`${I18n.t(
                  "features.itWallet.support.errorCode"
                )} ${code} : ${I18n.t("global.buttons.copy")}`}
                value={code}
                onPress={() => clipboardSetStringWithFeedback(code)}
              />
              <VSpacer size={24} />
            </View>
          )}
        </VStack>
      </VStack>
    )
  });

  return { bottomSheet, present, dismiss, hasContactMethods };
};
