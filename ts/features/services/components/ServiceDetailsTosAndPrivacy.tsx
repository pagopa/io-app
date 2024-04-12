import React, { useCallback } from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import {
  Divider,
  ListItemAction,
  ListItemHeader,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { openWebUrl } from "../../../utils/url";
import { useIOSelector } from "../../../store/hooks";
import { serviceMetadataByIdSelector } from "../store/reducers/servicesById";
import { ServiceId } from "../../../../definitions/backend/ServiceId";

type TosAndPrivacyListItem = {
  condition?: boolean;
} & Omit<ListItemAction, "variant" | "accessibilityLabel">;

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
      <ListItemAction
        {...rest}
        accessibilityLabel={rest.label}
        variant="primary"
      />
    ),
    []
  );

  if (filteredTosAndPrivacyListItems.length === 0) {
    return null;
  }

  return (
    <>
      <VSpacer size={40} />
      <FlatList
        ListHeaderComponent={
          <ListItemHeader
            label={I18n.t("services.details.tosAndPrivacy.title")}
          />
        }
        ItemSeparatorComponent={() => <Divider />}
        data={filteredTosAndPrivacyListItems}
        keyExtractor={item => item.label}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </>
  );
};
