import { useCallback } from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import {
  Divider,
  IOVisualCostants,
  ListItemAction,
  ListItemHeader
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { openWebUrl } from "../../../../utils/url";
import { useIOSelector } from "../../../../store/hooks";
import { serviceMetadataByIdSelector } from "../store/selectors";
import { ServiceId } from "../../../../../definitions/services/ServiceId";

type TosAndPrivacyListItem = {
  condition?: boolean;
} & Omit<ListItemAction, "variant">;

export type ServiceDetailsTosAndPrivacyProps = {
  serviceId: ServiceId;
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
      ListHeaderComponent={
        <ListItemHeader
          label={I18n.t("services.details.tosAndPrivacy.title")}
        />
      }
      ItemSeparatorComponent={() => <Divider />}
      contentContainerStyle={{
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      data={filteredTosAndPrivacyListItems}
      keyExtractor={item => item.label}
      renderItem={renderItem}
      scrollEnabled={false}
    />
  );
};
