import {
  ContentWrapper,
  Divider,
  ListItemHeader,
  VStack
} from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { View } from "react-native";

import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
import { getMixPanelCredential } from "../../../analytics/utils";
import { useItwCredentialName } from "../../../common/hooks/useItwCredentialName";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../navigation/routes";
import { trackItwConsentManagement } from "../analytics";
import { ItwConsentManagementEmptyState } from "../components/ItwConsentManagementEmptyState";
import { ItwConsentManagementListItem } from "../components/ItwConsentManagementListItem";
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
      trackItwConsentManagement({ credential: mixPanelCredential });
    }, [mixPanelCredential])
  );

  const navigateToDetail = useCallback(
    (consentKey: string) =>
      navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.PRESENTATION.CONSENT_MANAGEMENT_DETAIL,
        params: { consentKey, credentialType }
      }),
    [credentialType, navigation]
  );

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
        {entries.length === 0 ? (
          <ItwConsentManagementEmptyState />
        ) : (
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
            </VStack>
          </View>
        )}
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
