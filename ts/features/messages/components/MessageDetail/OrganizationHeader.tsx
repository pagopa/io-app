import {
  Avatar,
  Body,
  BodySmall,
  IOColors,
  IOSpacingScale,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useCallback } from "react";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { SERVICES_ROUTES } from "../../../services/common/navigation/routes";
import { messagePaymentDataSelector } from "../../store/reducers/detailsById";
import { UIMessageId } from "../../types";
import { AvatarDouble } from "../Home/DS/AvatarDouble";

export type OrganizationHeaderProps = {
  messageId: UIMessageId;
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
  return (
    <View
      style={[styles.item, { borderColor: IOColors[theme["divider-default"]] }]}
    >
      <View style={{ flex: 1 }}>
        <Body weight="Semibold">{organizationName}</Body>
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
