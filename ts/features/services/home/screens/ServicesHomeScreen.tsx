import { HeaderActionProps } from "@pagopa/io-app-design-system";
import { useCallback, useMemo } from "react";
import { View } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import I18n from "i18next";
import { Institution } from "../../../../../definitions/services/Institution";
import SectionStatusComponent from "../../../../components/SectionStatus";
import { useHeaderFirstLevel } from "../../../../hooks/useHeaderFirstLevel";
import { useTabItemPressWhenScreenActive } from "../../../../hooks/useTabItemPressWhenScreenActive";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { useServicesHomeBottomSheet } from "../hooks/useServicesHomeBottomSheet";
import { InstitutionList } from "../components/InstitutionList";
import * as analytics from "../../common/analytics";

export const ServicesHomeScreen = () => {
  const navigation = useIONavigation();

  /* CODE RELATED TO THE HEADER -- START */

  const scrollViewContentRef = useAnimatedRef<Animated.FlatList<Institution>>();

  const { bottomSheet, present } = useServicesHomeBottomSheet();

  const handleSearch = useCallback(() => {
    analytics.trackSearchStart({ source: "header_icon" });
    navigation.navigate(SERVICES_ROUTES.SEARCH);
  }, [navigation]);

  const actionSettings: HeaderActionProps = useMemo(
    () => ({
      icon: "coggle",
      accessibilityLabel: I18n.t("global.buttons.settings"),
      onPress: () => {
        analytics.trackServicesPreferences();
        present();
      }
    }),
    [present]
  );

  const actionSearch: HeaderActionProps = useMemo(
    () => ({
      icon: "search",
      accessibilityLabel: I18n.t("global.accessibility.search"),
      onPress: handleSearch
    }),
    [handleSearch]
  );

  useHeaderFirstLevel({
    currentRoute: SERVICES_ROUTES.SERVICES_HOME,
    headerProps: {
      title: I18n.t("services.title"),
      animatedFlatListRef: scrollViewContentRef,
      actions: [actionSearch, actionSettings]
    }
  });

  /* CODE RELATED TO THE HEADER -- END */

  /* Scroll to top when the active tab is tapped */
  useTabItemPressWhenScreenActive(
    useCallback(
      () =>
        scrollViewContentRef.current?.scrollToOffset({
          offset: 0,
          animated: true
        }),
      [scrollViewContentRef]
    ),
    false
  );

  return (
    <View style={{ flex: 1 }}>
      <InstitutionList scrollViewContentRef={scrollViewContentRef} />
      <SectionStatusComponent sectionKey={"services"} />
      {bottomSheet}
    </View>
  );
};
