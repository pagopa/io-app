import {
  Avatar,
  Body,
  BodySmall,
  IOColors,
  IOSpacingScale,
  useIOTheme
} from "@pagopa/io-app-design-system";
import i18n from "i18next";
import { useCallback } from "react";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { thirdPartySenderDenominationSelector } from "../../../pn/aar/store/selectors";
import { SERVICES_ROUTES } from "../../../services/common/navigation/routes";
import { messagePaymentDataSelector } from "../../store/reducers/detailsById";
import { isThirdParyMessageAarSelector } from "../../store/reducers/thirdPartyById";
import { AvatarDouble } from "../Home/DS/AvatarDouble";

export type OrganizationHeaderProps = {
  messageId: string;
  organizationName: string;
  serviceId: ServiceId;
  serviceName: string;
  logoUri?: ImageSourcePropType;
};

const ITEM_PADDING_VERTICAL: IOSpacingScale = 6;

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: ITEM_PADDING_VERTICAL,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth
  }
});

export const OrganizationHeader = ({
  messageId,
  logoUri,
  serviceId,
  organizationName,
  serviceName
}: OrganizationHeaderProps) => {
  const theme = useIOTheme();

  const navigation = useIONavigation();
  const paymentData = useIOSelector(state =>
    messagePaymentDataSelector(state, messageId)
  );
  const isEphemeralAar = useIOSelector(state =>
    isThirdParyMessageAarSelector(state, messageId)
  );
  const maybeSenderDenomination = useIOSelector(state =>
    thirdPartySenderDenominationSelector(state, messageId)
  );
  const navigateToServiceDetails = useCallback(
    () =>
      navigation.navigate(SERVICES_ROUTES.SERVICES_NAVIGATOR, {
        screen: SERVICES_ROUTES.SERVICE_DETAIL,
        params: {
          serviceId
        }
      }),
    [navigation, serviceId]
  );

  if (isEphemeralAar && maybeSenderDenomination === undefined) {
    return null;
  }

  const OrganizationName = () =>
    isEphemeralAar ? (
      <Body weight="Regular" color={"black"} testID="org-name-aar">
        {maybeSenderDenomination}
        <BodySmall weight="Regular">
          {i18n.t(
            "features.pn.aar.flow.displayingNotificationData.headerText-through"
          )}
        </BodySmall>
      </Body>
    ) : (
      <Body testID="org-name" weight="Semibold">
        {organizationName}
      </Body>
    );

  return (
    <View
      testID="organization-header"
      style={[styles.item, { borderColor: IOColors[theme["divider-default"]] }]}
    >
      <View style={{ flex: 1 }}>
        <OrganizationName />
        <BodySmall
          asLink
          accessibilityRole="button"
          onPress={navigateToServiceDetails}
          textStyle={{ textDecorationLine: "none" }}
          weight="Semibold"
        >
          {serviceName}
        </BodySmall>
      </View>
      <View>
        {paymentData ? (
          <AvatarDouble backgroundLogoUri={logoUri} />
        ) : (
          <Avatar logoUri={logoUri} size="small" />
        )}
      </View>
    </View>
  );
};
