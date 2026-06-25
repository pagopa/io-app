import {
  BannerErrorState,
  ModuleCredential,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { PropsWithChildren } from "react";

import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwFetchCredentialsCatalogue } from "../../credentialsCatalogue/store/actions";
import {
  itwIsCatalogueEnabledForCredentialsList,
  itwIsCredentialsCatalogueLoading,
  itwIsCredentialsCatalogueUnavailable
} from "../../credentialsCatalogue/store/selectors";

export const AsyncCredentialsCatalogue = ({ children }: PropsWithChildren) => {
  const dispatch = useIODispatch();
  const isCatalogueLoading = useIOSelector(itwIsCredentialsCatalogueLoading);
  const isCatalogueUnavailable = useIOSelector(
    itwIsCredentialsCatalogueUnavailable
  );
  const isCatalogueEnabledForCredentialsList = useIOSelector(
    itwIsCatalogueEnabledForCredentialsList
  );

  const loadingContent = Array.from({ length: 5 }).map((_, i) => (
    <ModuleCredential isLoading key={`loading-item-${i}`} />
  ));

  const content = () => {
    if (!isCatalogueEnabledForCredentialsList) {
      return children;
    }

    if (isCatalogueLoading) {
      return loadingContent;
    }

    if (isCatalogueUnavailable) {
      return (
        <BannerErrorState
          actionText={I18n.t(
            "features.itWallet.credentialsCatalogue.failure.action"
          )}
          label={I18n.t(
            "features.itWallet.credentialsCatalogue.failure.content"
          )}
          onPress={() => dispatch(itwFetchCredentialsCatalogue.request())}
        />
      );
    }

    return children;
  };

  return <VStack space={8}>{content()}</VStack>;
};
