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

import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { SERVICES_ROUTES } from "../../../services/common/navigation/routes";
import { messagePaymentDataSelector } from "../../store/reducers/detailsById";
import { AvatarDouble } from "../Home/DS/AvatarDouble";

export type OrganizationHeaderProps = {
  canNavigateToServiceDetails?: boolean;
  logoUri?: ImageSourcePropType;
  messageId: string;
  organizationName: string;
  serviceId: ServiceId;
  serviceName: string;
  thirdPartySenderDenomination?: string;
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
  serviceName,
  thirdPartySenderDenomination,
  canNavigateToServiceDetails = true
}: OrganizationHeaderProps) => {
  const theme = useIOTheme();

  const navigation = useIONavigation();
  const paymentData = useIOSelector(state =>
    messagePaymentDataSelector(state, messageId)
  );
  const navigateToServiceDetails = useCallback(() => {
    if (!canNavigateToServiceDetails) {
      return;
    }
    navigation.navigate(SERVICES_ROUTES.SERVICES_NAVIGATOR, {
      screen: SERVICES_ROUTES.SERVICE_DETAIL,
      params: {
        serviceId
      }
    });
  }, [navigation, serviceId, canNavigateToServiceDetails]);

  const OrganizationNameComponent = () =>
    thirdPartySenderDenomination ? (
      <BodySmall
        color={theme["textBody-default"]}
        testID="org-name-aar"
        weight="Regular"
      >
        {thirdPartySenderDenomination}
        <BodySmall weight="Regular">
          {i18n.t(
            "features.pn.aar.flow.displayingNotificationData.headerText-through"
          )}
        </BodySmall>
      </BodySmall>
    ) : (
      <Body testID="org-name" weight="Semibold">
        {organizationName}
      </Body>
    );

  return (
    <View
      style={[styles.item, { borderColor: IOColors[theme["divider-default"]] }]}
      testID="organization-header"
    >
      <View style={{ flex: 1 }}>
        <OrganizationNameComponent />
        <BodySmall
          accessibilityRole="button"
          asLink
          onPress={navigateToServiceDetails}
          testID="service-name"
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
