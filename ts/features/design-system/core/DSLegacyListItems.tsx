import { Divider, H4, VStack, useIOTheme } from "@pagopa/io-app-design-system";

import { Alert } from "react-native";
import ListItemComponent from "../../../components/screens/ListItemComponent";
import OrderOption from "../../bonus/cgn/components/merchants/search/OrderOption";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const onListItemPress = () => Alert.alert("Action triggered");

const componentMargin = 24;
const sectionTitleMargin = 16;
const blockMargin = 48;

export const DSLegacyListItems = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Legacy List Items"}>
      <VStack space={blockMargin}>
        <VStack space={componentMargin}>
          <DSComponentViewerBox name="ListItemComponent (title)">
            <ListItemComponent title={"Title"} onPress={onListItemPress} />
          </DSComponentViewerBox>
          <DSComponentViewerBox name="ListItemComponent (title + subtitle)">
            <ListItemComponent
              title={"Title"}
              subTitle="Subtitle"
              onPress={onListItemPress}
            />
          </DSComponentViewerBox>
          <DSComponentViewerBox name="ListItemComponent (without icon)">
            <ListItemComponent
              title={"Title"}
              hideIcon={true}
              onPress={onListItemPress}
            />
          </DSComponentViewerBox>
          <DSComponentViewerBox name="ListItemComponent (without separator)">
            <ListItemComponent
              title={"Title"}
              onPress={onListItemPress}
              hideSeparator={true}
            />
          </DSComponentViewerBox>
          <DSComponentViewerBox name="ListItemComponent (stress test)">
            <ListItemComponent
              title={"Let's try a looong looooong looooooooong title"}
              subTitle="A loooong looooooong looooooooooong subtitle, too"
              onPress={onListItemPress}
            />
          </DSComponentViewerBox>
          <DSComponentViewerBox name="ListItemComponent (stress test, no truncated subtitle)">
            <ListItemComponent
              title={"Let's try a looong looooong looooooooong title"}
              subTitle="A loooong looooooong looooooooooong subtitle, too"
              useExtendedSubTitle={true}
              onPress={onListItemPress}
            />
          </DSComponentViewerBox>

          <DSComponentViewerBox name="ListItemComponent (badge)">
            <ListItemComponent
              title={"A looong looooong looooooooong looooooooooong title"}
              hasBadge={true}
              onPress={onListItemPress}
            />
          </DSComponentViewerBox>
          <DSComponentViewerBox name="ListItemComponent (badge)">
            <ListItemComponent
              title={"A looong looooong looooooooong looooooooooong title"}
              titleBadge="Badge"
              onPress={onListItemPress}
            />
          </DSComponentViewerBox>
          <DSComponentViewerBox name="ListItemComponent (custom icon)">
            <ListItemComponent
              title={"Title"}
              iconSize={16}
              iconName={"checkTickBig"}
              onPress={onListItemPress}
            />
          </DSComponentViewerBox>
          <DSComponentViewerBox name="ListItemComponent (switch)">
            <ListItemComponent
              title={"Setting with switch"}
              switchValue={true}
              accessibilityRole={"switch"}
              accessibilityState={{ checked: false }}
              isLongPressEnabled={true}
              onPress={onListItemPress}
            />
          </DSComponentViewerBox>
          <DSComponentViewerBox name="ListItemComponent (radio)">
            <ListItemComponent
              title={"Title"}
              subTitle={"Subtitle"}
              iconName={"legRadioOn"}
              smallIconSize={true}
              iconOnTop={true}
              onPress={onListItemPress}
            />
          </DSComponentViewerBox>
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>
            Derivated from ListItem (NativeBase)
          </H4>
          <VStack space={componentMargin}>
            <DSComponentViewerBox name="OrderOption">
              <OrderOption
                text={"Checked"}
                value={"Value"}
                checked={true}
                onPress={onListItemPress}
              />
              <Divider />
              <OrderOption
                text={"Unchecked"}
                value={"Value"}
                checked={false}
                onPress={onListItemPress}
              />
            </DSComponentViewerBox>
          </VStack>
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};
