import * as React from "react";
import { View } from "react-native";
import { View as NBView } from "native-base";

import { H2 } from "../../../components/core/typography/H2";
import { IOColors } from "../../../components/core/variables/IOColors";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { HSpacer, VSpacer } from "../../../components/core/spacer/Spacer";
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

    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginTop: 32, marginBottom: 16 }}
    >
      VSpacer
    </H2>

    {/* Vertical */}
    {IOSpacer.map((spacerEntry, i, arr) => (
      <React.Fragment key={`${spacerEntry}-${i}-vertical`}>
        <DSSpacerViewerBox orientation="vertical" size={spacerEntry} />
        {/* Don't add spacer to the last item. Quick and dirty
        alternative to the Stack component.
        https://stackoverflow.com/a/60975451 */}
        {i !== arr.length - 1 && <VSpacer size={24} />}
      </React.Fragment>
    ))}

    <H2
      color={"bluegrey"}
      weight={"SemiBold"}
      style={{ marginTop: 32, marginBottom: 16 }}
    >
      HSpacer
    </H2>

    {/* Horizontal */}
    <View style={{ flexDirection: "row" }}>
      {IOSpacer.map((spacerEntry, i, arr) => (
        <React.Fragment key={`${spacerEntry}-${i}-horizontal`}>
          <DSSpacerViewerBox orientation="horizontal" size={spacerEntry} />
          {i !== arr.length - 1 && <HSpacer size={16} />}
        </React.Fragment>
      ))}
    </View>

    <VSpacer size={40} />
    <VSpacer size={8} />
  </DesignSystemScreen>
);
