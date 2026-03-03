// AsyncCredentialsCatalogue.tsx
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
  itwIsCredentialsCatalogueLoading,
  itwIsCredentialsCatalogueUnavailable
} from "../../credentialsCatalogue/store/selectors";

/**
 * Local feature flag that enables catalogue loading/error handling.
 * Since credentials are still hardcoded and the catalogue barely used, we can keep it disabled.
 */
const CATALOGUE_ENABLED = false;

export const AsyncCredentialsCatalogue = ({ children }: PropsWithChildren) => {
  const dispatch = useIODispatch();
  const isCatalogueLoading = useIOSelector(itwIsCredentialsCatalogueLoading);
  const isCatalogueUnavailable = useIOSelector(
    itwIsCredentialsCatalogueUnavailable
  );

  const loadingContent = Array.from({ length: 5 }).map((_, i) => (
    <ModuleCredential key={`loading-item-${i}`} isLoading />
  ));

  const content = () => {
    if (!CATALOGUE_ENABLED) {
      return <>{children}</>;
    }

    if (isCatalogueLoading) {
      return <>{loadingContent}</>;
    }

    if (isCatalogueUnavailable) {
      return (
        <BannerErrorState
          label={I18n.t(
            "features.itWallet.credentialsCatalogue.failure.content"
          )}
          actionText={I18n.t(
            "features.itWallet.credentialsCatalogue.failure.action"
          )}
          onPress={() => dispatch(itwFetchCredentialsCatalogue.request())}
        />
      );
    }

    return <>{children}</>;
  };

  return <VStack space={8}>{content()}</VStack>;
};
