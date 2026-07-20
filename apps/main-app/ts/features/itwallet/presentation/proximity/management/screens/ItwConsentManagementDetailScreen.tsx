import {
  ContentWrapper,
  IOMarkdownLite,
  useIOToast,
  VStack
} from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useEffect, useMemo } from "react";
import { Alert } from "react-native";

import { IOScrollViewWithLargeHeader } from "../../../../../../components/ui/IOScrollViewWithLargeHeader";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
import { usePreventScreenCapture } from "../../../../../../utils/hooks/usePreventScreenCapture";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import {
  trackItwConsentManagementDetail,
  trackItwRevokeConsent,
  trackItwRevokeConsentOperationBlock,
  trackItwRevokeConsentOperationBlockAction
} from "../../analytics";
import { itwRevokeProximityConsentByKey } from "../../store/actions";
import { itwProximityConsentByKeySelector } from "../../store/selectors/consents";
import { ItwConsentClaims } from "../components/ItwConsentClaims";
import { getConsentSavedAtDescription } from "../components/ItwConsentManagementListItem";

export type ItwConsentManagementDetailScreenNavigationParams = {
  consentKey: string;
  credentialType: string;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CONSENT_MANAGEMENT_DETAIL"
>;

/** Shows and revokes one exact saved proximity consent. */
export const ItwConsentManagementDetailScreen = ({ route }: Props) => {
  const { consentKey } = route.params;
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const toast = useIOToast();
  const consentSelector = useMemo(
    () => itwProximityConsentByKeySelector(consentKey),
    [consentKey]
  );
  const consent = useIOSelector(consentSelector);
  const relyingParty =
    consent?.rpDisplayName ??
    consent?.rpId ??
    I18n.t(
      "features.itWallet.presentation.proximity.consentManagement.fallback"
    );

  usePreventScreenCapture();

  useEffect(() => {
    if (!consent) {
      navigation.goBack();
    }
  }, [consent, navigation]);

  useFocusEffect(
    useCallback(() => {
      if (consent) {
        trackItwConsentManagementDetail();
      }
    }, [consent])
  );

  const revokeConsent = useCallback(
    (confirmLabel: string) => {
      trackItwRevokeConsentOperationBlockAction(confirmLabel);
      dispatch(itwRevokeProximityConsentByKey(consentKey));
      toast.success(
        I18n.t(
          "features.itWallet.presentation.proximity.consentManagement.toast.done"
        )
      );
      navigation.goBack();
    },
    [consentKey, dispatch, navigation, toast]
  );

  const showRevokeAlert = useCallback(() => {
    if (!consent) {
      return;
    }

    const confirmLabel = I18n.t(
      "features.itWallet.presentation.proximity.consentManagement.alert.confirm"
    );
    const cancelLabel = I18n.t(
      "features.itWallet.presentation.proximity.consentManagement.alert.cancel"
    );

    trackItwRevokeConsent();
    trackItwRevokeConsentOperationBlock();
    Alert.alert(
      I18n.t(
        "features.itWallet.presentation.proximity.consentManagement.alert.title"
      ),
      I18n.t(
        "features.itWallet.presentation.proximity.consentManagement.alert.message",
        { relyingParty }
      ),
      [
        {
          onPress: () => revokeConsent(confirmLabel),
          style: "destructive",
          text: confirmLabel
        },
        {
          onPress: () => trackItwRevokeConsentOperationBlockAction(cancelLabel),
          style: "cancel",
          text: cancelLabel
        }
      ]
    );
  }, [consent, relyingParty, revokeConsent]);

  if (!consent) {
    return null;
  }

  const savedAtDescription = getConsentSavedAtDescription(consent.savedAt);

  return (
    <IOScrollViewWithLargeHeader
      actions={{
        type: "SingleButton",
        primary: {
          accessibilityLabel: I18n.t(
            "features.itWallet.presentation.proximity.consentManagement.accessibility.revoke",
            { relyingParty }
          ),
          color: "danger",
          label: I18n.t(
            "features.itWallet.presentation.proximity.consentManagement.detail.revokeAction"
          ),
          onPress: showRevokeAlert,
          testID: "revoke-consent-action"
        }
      }}
      title={{ label: relyingParty, section: savedAtDescription }}
    >
      <ContentWrapper>
        <VStack space={24}>
          <IOMarkdownLite
            content={I18n.t(
              "features.itWallet.presentation.proximity.consentManagement.detail.message",
              { relyingParty }
            )}
          />
          <ItwConsentClaims consent={consent} />
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
