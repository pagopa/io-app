import I18n from "i18next";
import { ContentWrapper, H3, useIOTheme } from "@pagopa/io-app-design-system";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";

export type ServiceFavouritesScreenRouteParams = undefined;

export function ServiceFavouritesScreen() {
  const theme = useIOTheme();
  useHeaderSecondLevel({
    title: ""
  });
  return (
    <ContentWrapper>
      <H3 accessibilityRole="header" color={theme["textHeading-secondary"]}>
        {I18n.t("services.favouriteServices.title")}
      </H3>
    </ContentWrapper>
  );
}
