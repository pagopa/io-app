import {
  View,
  SafeAreaView,
  ScrollView,
  FlatList,
  ListRenderItemInfo
} from "react-native";
import * as React from "react";
import { IOStyles } from "../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import ListItemComponent from "../../components/screens/ListItemComponent";
import SHOWROOM_ROUTES from "./navigation/routes";
import { ShowroomParamsList } from "./navigation/params";
import { ShowroomSection } from "./components/ShowroomSection";

type Props = IOStackNavigationRouteProps<ShowroomParamsList, "SHOWROOM_MAIN">;

export const Showroom = (props: Props) => {
  const renderItem = (info: ListRenderItemInfo<string>): React.ReactElement => {
    const { item } = info;

    return (
      <ListItemComponent
        title={item}
        onPress={() => props.navigation.navigate(item)}
      />
    );
  };

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("profile.main.showroom")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={IOStyles.flex}>
          <View style={IOStyles.horizontalContentPadding}>
            <ShowroomSection title={"Foundation"}>
              <FlatList
                data={Object.values(SHOWROOM_ROUTES.FOUNDATION)}
                renderItem={renderItem}
              />
            </ShowroomSection>

            <ShowroomSection title={"Legacy"}>
              <FlatList
                data={Object.values(SHOWROOM_ROUTES.LEGACY)}
                renderItem={renderItem}
              />
            </ShowroomSection>
            {/* <NBView spacer={true} large={true} />
            <ColorsShowroom /> */}

            {/* 
            <TypographyShowroom />
            <NBView spacer={true} large={true} />
            <SelectionShowroom />
            <NBView spacer={true} large={true} />
            <OthersShowroom />
            <NBView spacer={true} large={true} />
            <ButtonsShowroom />
            <NBView spacer={true} large={true} />
            <TextFieldsShowroom />
            <NBView spacer={true} large={true} />
            <AdviceShowroom />
            <NBView spacer={true} large={true} />
            <ToastNotificationsShowroom />
            <NBView spacer={true} large={true} />
            <PictogramsShowroom />
            <NBView spacer={true} large={true} />
            <IconsShowroom />
            <NBView spacer={true} large={true} />
            <LogosShowroom />
            <NBView spacer={true} large={true} />
            <IllustrationsShowroom /> */}
          </View>
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
