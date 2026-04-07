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
import { Errors } from "@pagopa/io-react-native-wallet";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { Fragment, JSX } from "react";
import { Linking, View } from "react-native";

import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { isDefined } from "../../../../utils/guards.ts";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { CredentialIssuanceFailure } from "../../machine/credential/failure";
import { IssuanceFailure } from "../../machine/eid/failure";
import { RemoteFailure } from "../../presentation/remote/machine/failure.ts";
import { ItwFailure } from "../utils/ItwFailureTypes.ts";
import {
  useItwZendeskSupport,
  ZendeskSubcategoryValue
} from "./useItwZendeskSupport";

const { isWalletProviderResponseError, isIssuerResponseError } = Errors;

type SupportContactMethods = Partial<{
  email: string;
  landline: string;
  mobile: string;
  website: string;
}>;

// The subcategory is fixed for now. In the future it can be made dynamic depending on the error type.
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
  credentialType?: string;
  failure:
    | CredentialIssuanceFailure
    | IssuanceFailure
    | ItwFailure
    | RemoteFailure;
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
  const { startItwZendeskSupport } = useItwZendeskSupport();
  const code = extractErrorCode(failure);

  const handleAskAssistance = () => {
    startItwZendeskSupport({
      subcategory: zendeskSubcategory,
      errorCode: code,
      logData: JSON.stringify(failure)
    });
  };

  const getContactMethods = (): Array<JSX.Element> => {
    if (supportChatEnabled) {
      return [
        <ListItemAction
          icon="chat"
          key="contact-method-chat"
          label={I18n.t("features.itWallet.support.chat")}
          onPress={() => {
            dismiss();
            handleAskAssistance();
          }}
          testID="contact-method-chat"
          variant="primary"
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
            icon="phone"
            label={I18n.t("features.itWallet.support.phone", {
              phoneNumber: value
            })}
            onPress={() => Linking.openURL(`tel:${value}`)}
            testID="contact-method-mobile"
            variant="primary"
          />
        ))
      ),
      pipe(
        O.fromNullable(contactMethods.email),
        O.fold(constNull, value => (
          <ListItemAction
            icon="chat"
            label={I18n.t("features.itWallet.support.email")}
            onPress={() => Linking.openURL(`mailto:${value}`)}
            testID="contact-method-email"
            variant="primary"
          />
        ))
      ),
      pipe(
        O.fromNullable(contactMethods.website),
        O.fold(constNull, value => (
          <ListItemAction
            icon="website"
            label={I18n.t("features.itWallet.support.website")}
            onPress={() => Linking.openURL(value)}
            testID="contact-method-website"
            variant="primary"
          />
        ))
      ),
      pipe(
        O.fromNullable(contactMethods.landline),
        O.fold(constNull, value => (
          <ListItemInfo
            icon="phone"
            label={I18n.t("features.itWallet.support.landline")}
            testID="contact-method-landline"
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
                accessibilityHint={I18n.t("clipboard.copyIntoClipboard")}
                icon="ladybug"
                label={I18n.t("features.itWallet.support.errorCode")}
                onPress={() => clipboardSetStringWithFeedback(code)}
                value={code}
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
