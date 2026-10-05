import {
  ContentWrapper,
  IOMarkdownLite,
  useIOToast,
  VStack
} from "@io-app/design-system";
import { StackActions, useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Alert } from "react-native";

import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../../navigation/params/AppParamsList";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../../store/hooks";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../navigation/routes";
import {
  trackItwConsentManagementDetail,
  trackItwRevokeConsent,
  trackItwRevokeConsentOperationBlock,
  trackItwRevokeConsentOperationBlockAction
} from "../analytics";
import { ItwConsentClaims } from "../components/ItwConsentClaims";
import { getConsentSavedAtDescription } from "../components/ItwConsentManagementListItem";
import { itwRevokeProximityConsentByKey } from "../store/actions";
import {
  itwProximityConsentByKeySelector,
  itwProximityConsentsByCredentialTypeSelector
} from "../store/selectors/consents";

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
  const { consentKey, credentialType } = route.params;
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const store = useIOStore();
  const toast = useIOToast();
  const isRevoking = useRef(false);
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
    if (!consent && !isRevoking.current) {
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

  const revokeConsent = useCallback(() => {
    // The explicit revocation owns navigation; the missing-consent effect is
    // only a fallback for a consent removed outside this screen.
    isRevoking.current = true;
    trackItwRevokeConsentOperationBlockAction("confirm");
    dispatch(itwRevokeProximityConsentByKey(consentKey));
    const remainingConsents = itwProximityConsentsByCredentialTypeSelector(
      credentialType
    )(store.getState());

    if (remainingConsents.length === 0) {
      navigation.dispatch(
        StackActions.replace(
          ITW_ROUTES.PRESENTATION.CONSENT_REVOCATION_SUCCESS,
          {
            credentialType
          }
        )
      );
      return;
    }

    toast.success(
      I18n.t(
        "features.itWallet.presentation.proximity.consentManagement.toast.done"
      )
    );
    navigation.goBack();
  }, [consentKey, credentialType, dispatch, navigation, store, toast]);

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
          onPress: revokeConsent,
          style: "destructive",
          text: confirmLabel
        },
        {
          onPress: () => trackItwRevokeConsentOperationBlockAction("cancel"),
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
          onPress: () => {
            trackItwRevokeConsent();
            showRevokeAlert();
          },
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
