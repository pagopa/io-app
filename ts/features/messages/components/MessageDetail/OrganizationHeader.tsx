import React, { useCallback } from "react";
import { ImageURISource, StyleSheet, View } from "react-native";
import {
  Avatar,
  IOSpacingScale,
  IOStyles,
  LabelSmall
} from "@pagopa/io-app-design-system";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { SERVICES_ROUTES } from "../../../services/common/navigation/routes";

export type OrganizationHeaderProps = {
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
  logoUri,
  serviceId,
  organizationName,
  serviceName
}: OrganizationHeaderProps) => {
  const navigation = useIONavigation();
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
        <LabelSmall fontSize="regular" color="grey-700">
          {organizationName}
        </LabelSmall>
        <LabelSmall
          fontSize="regular"
          color="blueIO-500"
          onPress={navigateToServiceDetails}
        >
          {serviceName}
        </LabelSmall>
      </View>
      <View style={styles.itemAvatar}>
        <Avatar logoUri={logoUri} size="small" />
      </View>
    </View>
  );
};
