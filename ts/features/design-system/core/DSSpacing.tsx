import * as React from "react";
import { View } from "react-native";
import { View as NBView } from "native-base";

import { H2 } from "../../../components/core/typography/H2";
import { IOColors } from "../../../components/core/variables/IOColors";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { Spacer } from "../../../components/core/spacer/Spacer";

export const DSSpacing = () => (
  <DesignSystemScreen title={"Spacing"}>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      NativeBase
    </H2>

    <View style={{ backgroundColor: IOColors.bluegreyLight }}>
      <NBView spacer={true} xsmall={true} />
    </View>
    <NBView spacer={true} />
    <View style={{ backgroundColor: IOColors.bluegreyLight }}>
      <NBView spacer={true} small={true} />
    </View>
    <NBView spacer={true} />
    <View style={{ backgroundColor: IOColors.bluegreyLight }}>
      <NBView spacer={true} />
    </View>
    <NBView spacer={true} />
    <View style={{ backgroundColor: IOColors.bluegreyLight }}>
      <NBView spacer={true} large={true} />
    </View>
    <NBView spacer={true} />
    <View style={{ backgroundColor: IOColors.bluegreyLight }}>
      <NBView spacer={true} extralarge={true} />
    </View>

    <View style={{ flexDirection: "row" }}>
      <View style={{ backgroundColor: IOColors.bluegreyLight }}>
        <NBView hspacer={true} xsmall={true} />
      </View>
      <NBView
        hspacer={true}
        style={{ backgroundColor: IOColors.bluegreyLight }}
      />
      <View style={{ backgroundColor: IOColors.bluegreyLight }}>
        <NBView hspacer={true} small={true} />
      </View>
      <NBView hspacer={true} />
      <View style={{ backgroundColor: IOColors.bluegreyLight }}>
        <NBView hspacer={true} />
      </View>
      <NBView hspacer={true} />
      <View style={{ backgroundColor: IOColors.bluegreyLight }}>
        <NBView hspacer={true} large={true} />
      </View>
      <NBView hspacer={true} />
      <View style={{ backgroundColor: IOColors.bluegreyLight }}>
        <NBView hspacer={true} extralarge={true} />
      </View>
    </View>

    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginTop: 16, marginBottom: 16 }}
    >
      Native
    </H2>
    <View style={{ backgroundColor: IOColors.blueUltraLight }}>
      <Spacer size="xsm" />
    </View>
    <Spacer />
    <View style={{ backgroundColor: IOColors.blueUltraLight }}>
      <Spacer size="sm" />
    </View>
    <Spacer />
    <View style={{ backgroundColor: IOColors.blueUltraLight }}>
      <Spacer />
    </View>
    <Spacer />
    <View style={{ backgroundColor: IOColors.blueUltraLight }}>
      <Spacer size="lg" />
    </View>
    <Spacer />
    <View style={{ backgroundColor: IOColors.blueUltraLight }}>
      <Spacer size="xlg" />
    </View>

    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginTop: 16, marginBottom: 16 }}
    >
      Native
    </H2>
    <View style={{ backgroundColor: IOColors.blueUltraLight }}>
      <Spacer orientation="horizontal" size="xsm" />
    </View>
    <Spacer orientation="horizontal" />
    <View style={{ backgroundColor: IOColors.blueUltraLight }}>
      <Spacer orientation="horizontal" size="sm" />
    </View>
    <Spacer orientation="horizontal" />
    <View style={{ backgroundColor: IOColors.blueUltraLight }}>
      <Spacer orientation="horizontal" />
    </View>
    <Spacer orientation="horizontal" />
    <View style={{ backgroundColor: IOColors.blueUltraLight }}>
      <Spacer orientation="horizontal" size="lg" />
    </View>
    <Spacer orientation="horizontal" />
    <View style={{ backgroundColor: IOColors.blueUltraLight }}>
      <Spacer orientation="horizontal" size="xlg" />
    </View>
  </DesignSystemScreen>
);
