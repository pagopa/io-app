import { SectionList, StatusBar, View, useColorScheme } from "react-native";
import * as React from "react";
import {
  useIOTheme,
  Divider,
  VSpacer,
  ListItemNav,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import { IOStyles } from "../../components/core/variables/IOStyles";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../../navigation/params/AppParamsList";
import { H1 } from "../../components/core/typography/H1";
import { LabelSmall } from "../../components/core/typography/LabelSmall";
import DESIGN_SYSTEM_ROUTES from "./navigation/routes";
import { DesignSystemParamsList } from "./navigation/params";

type Props = IOStackNavigationRouteProps<
  DesignSystemParamsList,
  "DESIGN_SYSTEM_MAIN"
>;

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
const DATA_ROUTES_DEBUG: RoutesProps = Object.values(
  DESIGN_SYSTEM_ROUTES.DEBUG
);
const DATA_ROUTES_SCREENS: RoutesProps = Object.values(
  DESIGN_SYSTEM_ROUTES.SCREENS
);
const DATA_ROUTES_LEGACY: RoutesProps = Object.values(
  DESIGN_SYSTEM_ROUTES.LEGACY
);

const DESIGN_SYSTEM_SECTION_DATA = [
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
    title: "Debug",
    data: DATA_ROUTES_DEBUG
  },
  {
    title: "Legacy",
    description:
      "You should not use the following components for present and future deployments. They're here just for reference.",
    data: DATA_ROUTES_LEGACY
  }
];

export const DesignSystem = (props: Props) => {
  const theme = useIOTheme();
  const colorScheme = useColorScheme();

  const renderDSNavItem = ({
    item: { title, route }
  }: {
    item: { title: string; route: string };
  }) => (
    <ListItemNav
      accessibilityLabel={`Go to the ${title} page`}
      value={title}
      onPress={() => props.navigation.navigate(route as keyof AppParamsList)}
    />
  );

  const renderDSSection = ({
    section: { title, description }
  }: {
    section: { title: string; description?: string };
  }) => (
    <View style={{ marginBottom: 8 }}>
      <H1 color={theme["textHeading-default"]}>{title}</H1>
      {description && (
        <LabelSmall weight={"Regular"} color={theme["textBody-tertiary"]}>
          {description}
        </LabelSmall>
      )}
    </View>
  );

  const renderDSSectionFooter = () => <VSpacer size={40} />;

  return (
    <>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "default"}
      />
      <SectionList
        keyExtractor={(item, index) => `${item.route}-${index}`}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[
          IOStyles.horizontalContentPadding,
          {
            paddingTop: IOVisualCostants.appMarginDefault
          }
        ]}
        renderSectionHeader={renderDSSection}
        renderSectionFooter={renderDSSectionFooter}
        renderItem={renderDSNavItem}
        ItemSeparatorComponent={() => <Divider />}
        sections={DESIGN_SYSTEM_SECTION_DATA}
      />
    </>
  );
};
