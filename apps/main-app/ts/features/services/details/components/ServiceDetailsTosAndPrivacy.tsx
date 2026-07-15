import {
  Divider,
  IOVisualCostants,
  ListItemAction,
  ListItemHeader
} from "@io-app/design-system";
import I18n from "i18next";
import { useCallback } from "react";
import { FlatList, ListRenderItemInfo } from "react-native";

import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { useIOSelector } from "../../../../store/hooks";
import { openWebUrl } from "../../../../utils/url";
import { serviceMetadataByIdSelector } from "../store/selectors";

export type ServiceDetailsTosAndPrivacyProps = {
  serviceId: ServiceId;
};

type TosAndPrivacyListItem = Omit<ListItemAction, "variant"> & {
  condition?: boolean;
};

export const ServiceDetailsTosAndPrivacy = ({
  serviceId
}: ServiceDetailsTosAndPrivacyProps) => {
  const serviceMetadataById = useIOSelector(state =>
    serviceMetadataByIdSelector(state, serviceId)
  );

  const { privacy_url, tos_url } = serviceMetadataById || {};

  const tosAndPrivacyListItems: ReadonlyArray<TosAndPrivacyListItem> = [
    {
      condition: !!tos_url,
      icon: "terms",
      label: I18n.t("services.details.tosAndPrivacy.tosLink"),
      onPress: () => openWebUrl(`${tos_url}`)
    },
    {
      condition: !!privacy_url,
      icon: "security",
      label: I18n.t("services.details.tosAndPrivacy.privacyLink"),
      onPress: () => openWebUrl(`${privacy_url}`)
    }
  ];

  const filteredTosAndPrivacyListItems = tosAndPrivacyListItems.filter(
    item => item.condition !== false
  );

  const renderItem = useCallback(
    ({
      item: { condition, ...rest }
    }: ListRenderItemInfo<TosAndPrivacyListItem>) => (
      <ListItemAction {...rest} variant="primary" />
    ),
    []
  );

  if (filteredTosAndPrivacyListItems.length === 0) {
    return null;
  }

  return (
    <FlatList
      contentContainerStyle={{
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      data={filteredTosAndPrivacyListItems}
      ItemSeparatorComponent={() => <Divider />}
      keyExtractor={item => item.label}
      ListHeaderComponent={
        <ListItemHeader
          label={I18n.t("services.details.tosAndPrivacy.title")}
        />
      }
      renderItem={renderItem}
      scrollEnabled={false}
    />
  );
};
