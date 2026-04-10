import { Fragment, JSX } from "react";
import { Linking, View } from "react-native";
import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import {
  Divider,
  ListItemAction,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { IssuanceFailure } from "../../machine/eid/failure";
import { CredentialIssuanceFailure } from "../../machine/credential/failure";
import { ItwFailure } from "../utils/ItwFailureTypes.ts";
import { extractItwFailureCode } from "../utils/itwFailureUtils";
import { RemoteFailure } from "../../presentation/remote/machine/failure.ts";
import { isDefined } from "../../../../utils/guards.ts";
import {
  useItwZendeskSupport,
  ZendeskSubcategoryValue
} from "./useItwZendeskSupport";

type SupportContactMethods = Partial<{
  email: string;
  mobile: string;
  landline: string;
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

type Props = {
  failure:
    | IssuanceFailure
    | CredentialIssuanceFailure
    | ItwFailure
    | RemoteFailure;
  credentialType?: string;
  supportChatEnabled: boolean;
  zendeskSubcategory: ZendeskSubcategoryValue;
  supportLink?: string;
};

/**
 * Hook that renders several support methods, with direct integration with Zendesk.
 */
export const useItwFailureSupportModal = ({
  failure,
  credentialType,
  supportChatEnabled,
  zendeskSubcategory,
  supportLink
}: Props) => {
  const { startItwZendeskSupport } = useItwZendeskSupport();
  const code = extractItwFailureCode(failure);

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
      <VStack space={24}>
        {hasContactMethods && (
          <View>
            <ListItemHeader
              label={I18n.t("features.itWallet.support.supportTitle")}
            />
            {supportLink && (
              <>
                <ListItemAction
                  testID="contact-method-help-center"
                  variant="primary"
                  icon="website"
                  label={I18n.t("features.itWallet.support.visitHelpCenter")}
                  onPress={() => Linking.openURL(supportLink)}
                />
                <Divider />
              </>
            )}
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
              accessibilityHint={I18n.t("clipboard.copyIntoClipboard")}
              value={code}
              onPress={() => clipboardSetStringWithFeedback(code)}
            />
            <VSpacer size={24} />
          </View>
        )}
      </VStack>
    )
  });

  return { bottomSheet, present, dismiss, hasContactMethods };
};
