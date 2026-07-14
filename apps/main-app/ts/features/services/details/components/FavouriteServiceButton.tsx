import { ListItemAction, useIOToast } from "@io-app/design-system";
import I18n from "i18next";
import { ComponentProps, memo } from "react";

import { ServiceDetails } from "../../../../../definitions/services/ServiceDetails";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import * as analytics from "../../common/analytics";
import { isFavouriteServicesEnabledSelector } from "../../common/store/selectors/remoteConfig";
import {
  addFavouriteServiceRequest,
  removeFavouriteService
} from "../../favouriteServices/store/actions";
import { isFavouriteServiceSelector } from "../../favouriteServices/store/selectors";

export type FavouriteServiceButtonProps = {
  service: ServiceDetails;
};

const FavouriteServiceButton = ({ service }: FavouriteServiceButtonProps) => {
  const dispatch = useIODispatch();
  const toast = useIOToast();

  const isFavouriteServicesEnabled = useIOSelector(
    isFavouriteServicesEnabledSelector
  );

  const isFavouriteService = useIOSelector(state =>
    isFavouriteServiceSelector(state, service.id)
  );

  if (!isFavouriteServicesEnabled) {
    return null;
  }

  const actionProps: ComponentProps<typeof ListItemAction> = isFavouriteService
    ? {
        variant: "primary",
        icon: "starFilled",
        label: I18n.t("services.favouriteServices.remove"),
        onPress: () => {
          dispatch(removeFavouriteService({ id: service.id }));
          analytics.trackServicesFavouritesRemove(service.id, "service_detail");
          toast.success(I18n.t("services.favouriteServices.toasts.removed"));
        },
        testID: "favourite-service-remove-button"
      }
    : {
        variant: "primary",
        icon: "starEmpty",
        label: I18n.t("services.favouriteServices.add"),
        onPress: () => {
          dispatch(
            addFavouriteServiceRequest({
              id: service.id,
              institution: service.organization,
              name: service.name,
              addedAt: Date.now()
            })
          );
          analytics.trackServicesFavouritesAdd(service.id);
        },
        testID: "favourite-service-add-button"
      };

  return <ListItemAction {...actionProps} />;
};

const MemoizedFavouriteServiceButton = memo(FavouriteServiceButton);

export { MemoizedFavouriteServiceButton as FavouriteServiceButton };
