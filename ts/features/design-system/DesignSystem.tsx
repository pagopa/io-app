import { SectionList, View } from "react-native";
import * as React from "react";
import { IOStyles } from "../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../../navigation/params/AppParamsList";
import { H1 } from "../../components/core/typography/H1";
import { LabelSmall } from "../../components/core/typography/LabelSmall";
import { VSpacer } from "../../components/core/spacer/Spacer";
import ListItemNav from "../../components/ui/ListItemNav";
import DESIGN_SYSTEM_ROUTES from "./navigation/routes";
import { DesignSystemParamsList } from "./navigation/params";
import { Divider } from "../../components/core/Divider";

type Props = IOStackNavigationRouteProps<
  DesignSystemParamsList,
  "DESIGN_SYSTEM_MAIN"
>;

type RoutesProps = Array<{
  title: string;
  description?: string;
  route: string;
}>;

const DATA_ROUTES_FOUNDATION: RoutesProps = Object.values(
  DESIGN_SYSTEM_ROUTES.FOUNDATION
);
const DATA_ROUTES_COMPONENTS: RoutesProps = Object.values(
  DESIGN_SYSTEM_ROUTES.COMPONENTS
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
    title: "Legacy",
    description:
      "You should not use the following components for present and future deployments. They're here just for reference.",
    data: DATA_ROUTES_LEGACY
  }
];

export const DesignSystem = (props: Props) => (
  <BaseScreenComponent
    goBack={true}
    headerTitle={I18n.t("profile.main.designSystem")}
  >
    <SectionList
      contentContainerStyle={IOStyles.horizontalContentPadding}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section: { title, description } }) => (
        <View style={{ marginBottom: 8 }}>
          <H1>{title}</H1>
          {description && (
            <LabelSmall weight={"Regular"} color="bluegrey">
              {description}
            </LabelSmall>
          )}
        </View>
      )}
      renderSectionFooter={() => <VSpacer size={40} />}
      renderItem={({ item }) => (
        <ListItemNav
          accessibilityLabel={`Go to the ${item.title} page`}
          value={item.title}
          onPress={() =>
            props.navigation.navigate(item.route as keyof AppParamsList)
          }
        />
      )}
      ItemSeparatorComponent={() => <Divider />}
      keyExtractor={(item, index) => `${item.route}-${index}`}
      sections={DESIGN_SYSTEM_SECTION_DATA}
    />
  </BaseScreenComponent>
);
