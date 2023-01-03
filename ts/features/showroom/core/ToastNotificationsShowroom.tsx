import * as React from "react";
import { Text as NBText, View as NBView, Toast as NBToast } from "native-base";

import { SafeAreaView, ScrollView, View } from "react-native";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { showToast } from "../../../utils/showToast";
import { H2 } from "../../../components/core/typography/H2";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";

export const ToastNotificationsShowroom = () => (
  <BaseScreenComponent
    goBack={true}
    headerTitle={"Toast Nofications (NativeBase)"}
  >
    <SafeAreaView style={IOStyles.flex}>
      <ScrollView>
        <View style={IOStyles.horizontalContentPadding}>
          <H2
            color={"bluegrey"}
            weight={"SemiBold"}
            style={{ marginBottom: 16 }}
          >
            Type
          </H2>

          <ButtonDefaultOpacity
            bordered={true}
            block={true}
            onPress={() => {
              NBToast.show({
                text: "Here's the default behavior"
              });
            }}
          >
            <NBText>Default behavior</NBText>
          </ButtonDefaultOpacity>

          <NBView spacer={true} />

          <ButtonDefaultOpacity
            bordered={true}
            block={true}
            onPress={() => {
              showToast("Example of a danger message");
            }}
          >
            <NBText>Danger</NBText>
          </ButtonDefaultOpacity>

          <NBView spacer={true} />

          <ButtonDefaultOpacity
            bordered={true}
            block={true}
            onPress={() => {
              showToast("Example of a success message", "success");
            }}
          >
            <NBText>Success</NBText>
          </ButtonDefaultOpacity>

          <NBView spacer={true} />

          <ButtonDefaultOpacity
            bordered={true}
            block={true}
            onPress={() => {
              showToast("Example of a warning message", "warning");
            }}
          >
            <NBText>Warning</NBText>
          </ButtonDefaultOpacity>

          <H2
            color={"bluegrey"}
            weight={"SemiBold"}
            style={{ marginTop: 24, marginBottom: 16 }}
          >
            Position
          </H2>
          <ButtonDefaultOpacity
            bordered={true}
            block={true}
            onPress={() => {
              showToast("Here's the notification at the top", "danger", "top");
            }}
          >
            <NBText>Default · Top</NBText>
          </ButtonDefaultOpacity>

          <NBView spacer={true} />

          <ButtonDefaultOpacity
            bordered={true}
            block={true}
            onPress={() => {
              showToast(
                "Here's the notification at the center",
                "danger",
                "center"
              );
            }}
          >
            <NBText>Default · Center</NBText>
          </ButtonDefaultOpacity>

          <NBView spacer={true} />

          <ButtonDefaultOpacity
            bordered={true}
            block={true}
            onPress={() => {
              showToast(
                "Here's the notification at the bottom",
                "danger",
                "bottom"
              );
            }}
          >
            <NBText>Default · Bottom</NBText>
          </ButtonDefaultOpacity>

          <H2
            color={"bluegrey"}
            weight={"SemiBold"}
            style={{ marginTop: 24, marginBottom: 16 }}
          >
            Misc
          </H2>

          <ButtonDefaultOpacity
            bordered={true}
            block={true}
            onPress={() => {
              NBToast.show({
                text: "Here's the default behavior with multi-line loooong loooooong text"
              });
            }}
          >
            <NBText>Multi-line text</NBText>
          </ButtonDefaultOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  </BaseScreenComponent>
);
