import {
  Body,
  IOButton,
  ListItemHeader,
  ListItemInfo,
  ListItemNav,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { Alert, View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { ITW_ROUTES } from "../../navigation/routes";
import {
  itwRevokeAllProximityConsents,
  itwRevokeProximityConsentByKey
} from "../../presentation/proximity/store/actions";
import { itwProximityConsentsEntriesSelector } from "../../presentation/proximity/store/selectors/consents";

export const ItwIso18013Section = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const consents = useIOSelector(itwProximityConsentsEntriesSelector);

  const handleRevokeConsent = (key: string) => {
    dispatch(itwRevokeProximityConsentByKey(key));
  };

  const handleRevokeAll = () => {
    Alert.alert(
      "Delete all consents",
      "Are you sure you want to delete all stored proximity consents?",
      [
        { text: I18n.t("global.buttons.cancel"), style: "cancel" },
        {
          text: I18n.t("global.buttons.confirm"),
          style: "destructive",
          onPress: () => dispatch(itwRevokeAllProximityConsents())
        }
      ]
    );
  };

  return (
    <View>
      <ListItemHeader label="ISO 18013" />
      <ListItemNav
        value="Proximity flow playground"
        description="Navigate to the ITW proximity flow playground"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.PLAYGROUNDS.ISO_18013_PROXIMITY
          })
        }
      />
      <ListItemHeader label="Granted Consents" />
      {consents.length === 0 ? (
        <Body>No consents stored</Body>
      ) : (
        <VStack space={8}>
          {consents.map(({ key, consent }) => (
            <ListItemInfo
              key={key}
              label={consent.rpId}
              value={key}
              numberOfLines={1}
              endElement={{
                type: "iconButton",
                componentProps: {
                  icon: "trashcan",
                  onPress: () => handleRevokeConsent(key),
                  accessibilityLabel: `Delete consent for ${consent.rpId}`
                }
              }}
            />
          ))}
          <IOButton
            variant="solid"
            color="danger"
            label="Delete all consents"
            onPress={handleRevokeAll}
          />
        </VStack>
      )}
    </View>
  );
};
