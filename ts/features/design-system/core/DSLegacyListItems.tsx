import * as React from "react";

import DetailedlistItemComponent from "../../../components/DetailedlistItemComponent";
import { H2 } from "../../../components/core/typography/H2";
import ListItemComponent from "../../../components/screens/ListItemComponent";
import OrderOption from "../../bonus/cgn/components/merchants/search/OrderOption";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSLegacyListItems = () => (
  <DesignSystemScreen title={"Legacy List Items"}>
    <DSComponentViewerBox name="ListItemComponent (title)">
      <ListItemComponent
        title={"Title"}
        onPress={() => alert("Action triggered")}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemComponent (title + subtitle)">
      <ListItemComponent
        title={"Title"}
        subTitle="Subtitle"
        onPress={() => alert("Action triggered")}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemComponent (without icon)">
      <ListItemComponent
        title={"Title"}
        hideIcon={true}
        onPress={() => alert("Action triggered")}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemComponent (without separator)">
      <ListItemComponent
        title={"Title"}
        onPress={() => alert("Action triggered")}
        hideSeparator={true}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemComponent (stress test)">
      <ListItemComponent
        title={"Let's try a looong looooong looooooooong title"}
        subTitle="A loooong looooooong looooooooooong subtitle, too"
        onPress={() => alert("Action triggered")}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemComponent (stress test, no truncated subtitle)">
      <ListItemComponent
        title={"Let's try a looong looooong looooooooong title"}
        subTitle="A loooong looooooong looooooooooong subtitle, too"
        useExtendedSubTitle={true}
        onPress={() => alert("Action triggered")}
      />
    </DSComponentViewerBox>

    <DSComponentViewerBox name="ListItemComponent (badge)">
      <ListItemComponent
        title={"A looong looooong looooooooong looooooooooong title"}
        hasBadge={true}
        onPress={() => alert("Action triggered")}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemComponent (badge)">
      <ListItemComponent
        title={"A looong looooong looooooooong looooooooooong title"}
        titleBadge="Badge"
        onPress={() => alert("Action triggered")}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemComponent (custom icon)">
      <ListItemComponent
        title={"Title"}
        iconSize={12}
        iconName={"checkTickBig"}
        onPress={() => alert("Action triggered")}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemComponent (switch)">
      <ListItemComponent
        title={"Setting with switch"}
        switchValue={true}
        accessibilityRole={"switch"}
        accessibilityState={{ checked: false }}
        isLongPressEnabled={true}
        onPress={() => alert("Action triggered")}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemComponent (radio)">
      <ListItemComponent
        title={"Title"}
        subTitle={"Subtitle"}
        iconName={"legRadioOn"}
        smallIconSize={true}
        iconOnTop={true}
        onPress={() => alert("Action triggered")}
      />
    </DSComponentViewerBox>

    <H2
      color={"bluegrey"}
      weight={"Semibold"}
      style={{ marginBottom: 16, marginTop: 16 }}
    >
      Derivated from ListItem (NativeBase)
    </H2>
    <DSComponentViewerBox name="OrderOption">
      <OrderOption
        text={"Checked"}
        value={"Value"}
        checked={true}
        onPress={() => alert("Action triggered")}
      />
      <OrderOption
        text={"Unchecked"}
        value={"Value"}
        checked={false}
        onPress={() => alert("Action triggered")}
      />
    </DSComponentViewerBox>

    <H2
      color={"bluegrey"}
      weight={"Semibold"}
      style={{ marginBottom: 16, marginTop: 16 }}
    >
      Misc
    </H2>
    <DSComponentViewerBox name="DetailedlistItemComponent">
      <DetailedlistItemComponent
        isNew={true}
        text11={"Payment Recipient"}
        text12={"+200,00 €"}
        text2={"19/12/2022 - 1:25:23 PM"}
        text3={"Transaction Name"}
        onPressItem={() => alert("Action triggered")}
        accessible={true}
        accessibilityRole={"button"}
        accessibilityLabel={"Accessibility Label"}
      />
    </DSComponentViewerBox>
  </DesignSystemScreen>
);
