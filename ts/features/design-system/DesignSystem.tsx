import {
  BodySmall,
  Divider,
  H2,
  IOVisualCostants,
  ListItemNav,
  VSpacer,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationOptions,
  NativeStackNavigationProp
} from "@react-navigation/native-stack";
import { useLayoutEffect, useMemo, useState } from "react";
import { Platform, SectionList } from "react-native";
import { isSearchBarAvailableForCurrentPlatform } from "react-native-screens";
import { useScreenEndMargin } from "../../hooks/useScreenEndMargin";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import { DesignSystemParamsList } from "./navigation/params";
import DESIGN_SYSTEM_ROUTES from "./navigation/routes";

type SingleSectionProps = {
  title: string;
  description?: string;
  route: string;
};

type RoutesProps = Array<SingleSectionProps>;

const DATA_ROUTES_FOUNDATION: RoutesProps = Object.values(
  DESIGN_SYSTEM_ROUTES.FOUNDATION
);
const DATA_ROUTES_COMPONENTS: RoutesProps = Object.values(
  DESIGN_SYSTEM_ROUTES.COMPONENTS
);
const DATA_ROUTES_HEADERS: RoutesProps = Object.values(
  DESIGN_SYSTEM_ROUTES.HEADERS
);
const DATA_ROUTES_EXPERIMENTAL_LAB: RoutesProps = Object.values(
  DESIGN_SYSTEM_ROUTES.EXPERIMENTAL_LAB
);
const DATA_ROUTES_DEBUG: RoutesProps = Object.values(
  DESIGN_SYSTEM_ROUTES.DEBUG
);
const DATA_ROUTES_SCREENS: RoutesProps = Object.values(
  DESIGN_SYSTEM_ROUTES.SCREENS
);

type SectionDataProps = {
  title: string;
  description?: string;
  data: RoutesProps;
};

const DESIGN_SYSTEM_SECTION_DATA: Array<SectionDataProps> = [
  {
    title: "Foundation",
    data: DATA_ROUTES_FOUNDATION
  },
  {
    title: "Components",
    data: DATA_ROUTES_COMPONENTS
  },
  {
    title: "Headers",
    data: DATA_ROUTES_HEADERS
  },
  {
    title: "Screens",
    data: DATA_ROUTES_SCREENS
  },
  {
    title: "Experimental lab",
    data: DATA_ROUTES_EXPERIMENTAL_LAB
  },
  {
    title: "Debug",
    data: DATA_ROUTES_DEBUG
  }
];

export const DesignSystem = () => {
  const theme = useIOTheme();
  const navigation = useIONavigation();
  const nativeNavigation =
    useNavigation<NativeStackNavigationProp<DesignSystemParamsList>>();
  const [searchQuery, setSearchQuery] = useState("");

  const { screenEndMargin } = useScreenEndMargin();

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const sectionsToRender = useMemo(() => {
    if (normalizedQuery.length === 0) {
      return DESIGN_SYSTEM_SECTION_DATA;
    }

    return DESIGN_SYSTEM_SECTION_DATA.map(section => {
      const sectionMatches = section.title
        .toLowerCase()
        .includes(normalizedQuery);

      const filteredData = sectionMatches
        ? section.data
        : section.data.filter(item => {
            const titleMatch = item.title
              .toLowerCase()
              .includes(normalizedQuery);
            const descriptionMatch = item.description
              ? item.description.toLowerCase().includes(normalizedQuery)
              : false;

            return titleMatch || descriptionMatch;
          });

      return {
        ...section,
        data: filteredData
      };
    }).filter(section => section.data.length > 0);
  }, [normalizedQuery]);

  const renderDSNavItem = ({
    item: { title, route }
  }: {
    item: { title: string; route: string };
  }) => (
    <ListItemNav
      accessibilityLabel={`Go to the ${title} page`}
      value={title}
      onPress={() => navigation.navigate(route as any)}
    />
  );

  const renderDSSection = ({
    section: { title, description }
  }: {
    section: { title: string; description?: string };
  }) => (
    <VStack space={4}>
      <H2 weight="Bold" color={theme["textHeading-default"]}>
        {title}
      </H2>
      {description && (
        <BodySmall weight={"Regular"} color={theme["textBody-tertiary"]}>
          {description}
        </BodySmall>
      )}
    </VStack>
  );

  const renderDSSectionFooter = ({ section }: { section: SectionDataProps }) =>
    /* We exclude the last section because
    we already apply the `screenEndMargin` */
    sectionsToRender[sectionsToRender.length - 1]?.title ===
    section.title ? null : (
      <VSpacer size={32} />
    );

  useLayoutEffect(() => {
    if (!isSearchBarAvailableForCurrentPlatform) {
      return;
    }

    nativeNavigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Search components...",
        hideNavigationBar: false,
        onChangeText: (event: { nativeEvent: { text: string } }) => {
          setSearchQuery(event.nativeEvent.text);
        }
      } as NativeStackNavigationOptions["headerSearchBarOptions"]
    });
  }, [nativeNavigation, theme]);

  const renderListEmpty = () => (
    <VStack space={8}>
      <BodySmall weight="Regular" color={theme["textBody-tertiary"]}>
        No components found.
      </BodySmall>
    </VStack>
  );

  return (
    <SectionList
      ListHeaderComponent={Platform.OS === "ios" ? <VSpacer size={8} /> : null}
      keyExtractor={(item, index) => `${item.route}-${index}`}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={{
        paddingHorizontal: IOVisualCostants.appMarginDefault,
        paddingTop: IOVisualCostants.appMarginDefault,
        paddingBottom: screenEndMargin
      }}
      contentInsetAdjustmentBehavior="automatic"
      ListEmptyComponent={renderListEmpty}
      renderSectionHeader={renderDSSection}
      renderSectionFooter={renderDSSectionFooter}
      SectionSeparatorComponent={() => <VSpacer size={8} />}
      renderItem={renderDSNavItem}
      ItemSeparatorComponent={() => <Divider />}
      sections={sectionsToRender}
    />
  );
};
