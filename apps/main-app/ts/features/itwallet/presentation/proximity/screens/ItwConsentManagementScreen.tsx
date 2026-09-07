import {
  ContentWrapper,
  Divider,
  ListItemAction,
  ListItemHeader,
  VStack
} from "@io-app/design-system";
import { StackActions, useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo, useRef } from "react";
import { Alert, View } from "react-native";

import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { getMixPanelCredential } from "../../../analytics/utils";
import { useItwCredentialName } from "../../../common/hooks/useItwCredentialName";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../navigation/routes";
import { trackItwConsentManagement } from "../analytics";
import { ItwConsentManagementListItem } from "../components/ItwConsentManagementListItem";
import { itwRevokeProximityConsentsByCredentialType } from "../store/actions";
import { itwProximityConsentsEntriesByCredentialTypeSelector } from "../store/selectors/consents";

export type ItwConsentManagementScreenNavigationParams = {
  credentialType: string;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CONSENT_MANAGEMENT"
>;

/** Lists the saved proximity consents involving a specific credential type. */
export const ItwConsentManagementScreen = ({ route }: Props) => {
  const { credentialType } = route.params;
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const isRevoking = useRef(false);
  const credentialName = useItwCredentialName(credentialType);
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const consentsSelector = useMemo(
    () => itwProximityConsentsEntriesByCredentialTypeSelector(credentialType),
    [credentialType]
  );
  const entries = useIOSelector(consentsSelector);

  const mixPanelCredential = useMemo(
    () => getMixPanelCredential(credentialType, isItwL3),
    [credentialType, isItwL3]
  );

  useFocusEffect(
    useCallback(() => {
      if (entries.length === 0) {
        if (!isRevoking.current) {
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
            params: { credentialType }
          });
        }
        return;
      }
      trackItwConsentManagement({ credential: mixPanelCredential });
    }, [credentialType, entries.length, mixPanelCredential, navigation])
  );

  const navigateToDetail = useCallback(
    (consentKey: string) =>
      navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.PRESENTATION.CONSENT_MANAGEMENT_DETAIL,
        params: { consentKey, credentialType }
      }),
    [credentialType, navigation]
  );

  const showRevokeAllAlert = () => {
    Alert.alert(
      I18n.t(
        "features.itWallet.presentation.proximity.consentManagement.revokeAll.alert.title"
      ),
      I18n.t(
        "features.itWallet.presentation.proximity.consentManagement.revokeAll.alert.message"
      ),
      [
        {
          onPress: () => {
            isRevoking.current = true;
            dispatch(
              itwRevokeProximityConsentsByCredentialType(credentialType)
            );
            navigation.dispatch(
              StackActions.replace(
                ITW_ROUTES.PRESENTATION.CONSENT_REVOCATION_SUCCESS,
                {
                  credentialType
                }
              )
            );
          },
          style: "destructive",
          text: I18n.t(
            "features.itWallet.presentation.proximity.consentManagement.alert.confirm"
          )
        },
        {
          style: "cancel",
          text: I18n.t(
            "features.itWallet.presentation.proximity.consentManagement.alert.cancel"
          )
        }
      ]
    );
  };

  if (entries.length === 0) {
    return null;
  }

  return (
    <IOScrollViewWithLargeHeader
      description={I18n.t(
        "features.itWallet.presentation.proximity.consentManagement.subtitle",
        { credentialName }
      )}
      title={{
        label: I18n.t(
          "features.itWallet.presentation.proximity.consentManagement.title"
        )
      }}
    >
      <ContentWrapper>
        <View testID="consent-list">
          <VStack space={8}>
            <ListItemHeader
              label={I18n.t(
                "features.itWallet.presentation.proximity.consentManagement.header"
              )}
            />
            {entries.map(([consentKey, consent], index) => (
              <VStack key={consentKey} space={0}>
                {index > 0 && <Divider />}
                <ItwConsentManagementListItem
                  consent={consent}
                  onPress={() => navigateToDetail(consentKey)}
                />
              </VStack>
            ))}
            <ListItemAction
              accessibilityLabel={I18n.t(
                "features.itWallet.presentation.proximity.consentManagement.revokeAll.action"
              )}
              icon="trashcan"
              label={I18n.t(
                "features.itWallet.presentation.proximity.consentManagement.revokeAll.action"
              )}
              onPress={showRevokeAllAlert}
              testID="revoke-all-consents-action"
              variant="danger"
            />
          </VStack>
        </View>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
