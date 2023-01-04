import { SafeAreaView, SectionList, Text, View } from "react-native";
import { View as NBView } from "native-base";
import * as React from "react";
import { IOStyles } from "../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../../navigation/params/AppParamsList";
import ListItemComponent from "../../components/screens/ListItemComponent";
import { H1 } from "../../components/core/typography/H1";
import { IOColors } from "../../components/core/variables/IOColors";
import SHOWROOM_ROUTES from "./navigation/routes";
import { ShowroomParamsList } from "./navigation/params";

type Props = IOStackNavigationRouteProps<ShowroomParamsList, "SHOWROOM_MAIN">;

type RoutesProps = Array<{
  title: string;
  description?: string;
  route: string;
}>;

const DATA_ROUTES_FOUNDATION: RoutesProps = Object.values(
  SHOWROOM_ROUTES.FOUNDATION
);
const DATA_ROUTES_COMPONENTS: RoutesProps = Object.values(
  SHOWROOM_ROUTES.COMPONENTS
);
const DATA_ROUTES_LEGACY: RoutesProps = Object.values(SHOWROOM_ROUTES.LEGACY);

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
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nisi urna, maximus ac tempus eu, iaculis ut tortor.",
    data: DATA_ROUTES_LEGACY
  }
];

export const Showroom = (props: Props) => (
  <BaseScreenComponent
    goBack={true}
    headerTitle={I18n.t("profile.main.showroom")}
  >
    <SafeAreaView style={IOStyles.flex}>
      <SectionList
        contentContainerStyle={IOStyles.horizontalContentPadding}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { title, description } }) => (
          <View style={{ marginBottom: 8 }}>
            <H1>{title}</H1>
            {description && (
              <Text
                style={{
                  fontSize: 14,
                  color: IOColors.bluegreyDark,
                  lineHeight: 20
                }}
              >
                {description}
              </Text>
            )}
          </View>
        )}
        renderSectionFooter={() => <NBView spacer={true} extralarge={true} />}
        renderItem={({ item }) => (
          <ListItemComponent
            title={item.title}
            onPress={() =>
              props.navigation.navigate(item.route as keyof AppParamsList)
            }
          />
        )}
        keyExtractor={(item, index) => `${item.route}-${index}`}
        sections={DESIGN_SYSTEM_SECTION_DATA}
      />
    </SafeAreaView>
  </BaseScreenComponent>
);
