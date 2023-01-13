import * as React from "react";
import { View } from "react-native";
import { View as NBView } from "native-base";

import { H2 } from "../../../components/core/typography/H2";
import { IOColors } from "../../../components/core/variables/IOColors";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { DSSpacerViewerBox } from "../components/DSSpacerViewerBox";
import { IOSpacer } from "../../../components/core/variables/IOSpacing";

export const DSSpacing = () => (
  <DesignSystemScreen title={"Spacing"}>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      Spacer (NativeBase)
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
    <NBView spacer={true} />
    <View style={{ flexDirection: "row" }}>
      <View style={{ backgroundColor: IOColors.bluegreyLight, height: 50 }}>
        <NBView hspacer={true} small={true} />
      </View>
      <NBView hspacer={true} />
      <View style={{ backgroundColor: IOColors.bluegreyLight, height: 50 }}>
        <NBView hspacer={true} />
      </View>
      <NBView hspacer={true} />
      <View style={{ backgroundColor: IOColors.bluegreyLight, height: 50 }}>
        <NBView hspacer={true} large={true} />
      </View>
      <NBView hspacer={true} />
      <View style={{ backgroundColor: IOColors.bluegreyLight, height: 50 }}>
        <NBView hspacer={true} extralarge={true} />
      </View>
    </View>

    <VSpacer size={24} />

    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginTop: 16, marginBottom: 16 }}
    >
      Spacer (Native)
    </H2>

    {/* Vertical */}
    {IOSpacer.map(spacerEntry => (
      <DSSpacerViewerBox key={`${spacerEntry}-vertical`} size={spacerEntry} />
    ))}

    <VSpacer size={24} />

    {/* Horizontal */}
    <View style={{ flexDirection: "row" }}>
      {IOSpacer.map(spacerEntry => (
        <DSSpacerViewerBox
          key={`${spacerEntry}-horizontal`}
          orientation="horizontal"
          size={spacerEntry}
        />
      ))}
    </View>

    <VSpacer size={40} />
    <VSpacer size={8} />
  </DesignSystemScreen>
);
