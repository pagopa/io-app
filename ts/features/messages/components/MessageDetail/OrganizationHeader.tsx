import {
  Avatar,
  Body,
  IOSpacingScale,
  IOStyles,
  BodySmall,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useCallback } from "react";
import { ImageURISource, StyleSheet, View } from "react-native";
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
  logoUri?: ReadonlyArray<ImageURISource>;
};

const ITEM_PADDING_VERTICAL: IOSpacingScale = 6;
const AVATAR_MARGIN_LEFT: IOSpacingScale = 16;

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: ITEM_PADDING_VERTICAL
  },
  itemAvatar: {
    marginLeft: AVATAR_MARGIN_LEFT
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
    <View style={styles.item}>
      <View style={IOStyles.flex}>
        <Body weight="Semibold" color="grey-700">
          {organizationName}
        </Body>
        <BodySmall
          accessibilityRole="button"
          color={theme["interactiveElem-default"]}
          onPress={navigateToServiceDetails}
          weight="Semibold"
        >
          {serviceName}
        </BodySmall>
      </View>
      <View style={styles.itemAvatar}>
        {paymentData ? (
          <AvatarDouble backgroundLogoUri={logoUri} />
        ) : (
          <Avatar logoUri={logoUri} size="small" />
        )}
      </View>
    </View>
  );
};
