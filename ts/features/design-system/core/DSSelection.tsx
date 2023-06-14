import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useState } from "react";
import { CheckBox } from "../../../components/core/selection/checkbox/CheckBox";
import { RemoteSwitch } from "../../../components/core/selection/RemoteSwitch";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { H2 } from "../../../components/core/typography/H2";
import { CheckboxLabel } from "../../../components/core/selection/checkbox/CheckboxLabel";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { CheckboxListItem } from "../../../components/ui/CheckboxListItem";
import { Divider } from "../../../components/core/Divider";
import { H4 } from "../../../components/core/typography/H4";
import {
  NewRadioItem,
  RadioGroup
} from "../../../components/core/selection/RadioGroup";
import { SwitchLabel } from "../../../components/core/selection/checkbox/SwitchLabel";
import { NativeSwitch } from "../../../components/core/selection/checkbox/NativeSwitch";
import { SwitchListItem } from "../../../components/ui/SwitchListItem";

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    paddingVertical: 16
  }
});

export const DSSelection = () => (
  <DesignSystemScreen title={"Selection"}>
    <H2 weight={"Bold"} style={{ marginVertical: 16 }}>
      Checkbox
    </H2>
    {/* CheckboxLabel */}
    {renderCheckboxLabel()}
    {/* CheckboxListItem */}
    {renderCheckboxListItem()}

    <H2 weight={"Bold"} style={{ marginVertical: 16 }}>
      Radio
    </H2>
    {/* RadioListItem */}
    <RadioListItemsShowroom />

    <H2 weight={"Bold"} style={{ marginVertical: 16 }}>
      Switch
    </H2>
    {/* Native Switch */}
    <NativeSwitchShowroom />
    {/* SwitchListItem */}
    {renderSwitchListItem()}
    {/* SwitchLabel */}
    {renderAnimatedSwitch()}

    {/* Legacy components */}
    <H2 weight={"SemiBold"} style={{ marginBottom: 16, marginTop: 16 }}>
      Legacy components
    </H2>
    <H4>{"<CheckBox />"}</H4>
    <View style={styles.content}>
      <CheckBox />
      <CheckBox checked={true} />
    </View>
    <H4>{"<RemoteSwitch />"}</H4>
    <View style={styles.content}>
      <RemoteSwitch value={pot.none} />
      <RemoteSwitch
        value={pot.noneError(new Error())}
        onRetry={() => Alert.alert("Retry!")}
      />
      <RemoteSwitch value={pot.some(true)} />
      <RemoteSwitch value={pot.someUpdating(false, true)} />
      <RemoteSwitch value={pot.some(false)} />
      <RemoteSwitch value={pot.someUpdating(true, false)} />
      <VSpacer size={48} />
    </View>
  </DesignSystemScreen>
);

const renderCheckboxLabel = () => (
  <>
    <DSComponentViewerBox name="CheckboxLabel">
      <CheckboxLabel label="This is a test" />
      <VSpacer size={16} />
      <CheckboxLabel label="This is a test with a very loooong looooooooong loooooooong text" />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="CheckboxLabel (disabled)">
      <CheckboxLabel disabled checked={true} label="This is a test" />
      <VSpacer size={16} />
      <CheckboxLabel disabled label="This is a test" />
    </DSComponentViewerBox>
  </>
);

const renderCheckboxListItem = () => (
  <>
    <DSComponentViewerBox name="CheckboxListItem">
      <CheckboxListItem
        value="Usa configurazione rapida"
        accessibilityLabel={""}
      />
      <Divider />
      <CheckboxListItem
        icon="coggle"
        value="Usa configurazione rapida"
        accessibilityLabel={""}
      />
      <Divider />
      <CheckboxListItem
        value="Usa configurazione rapida"
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano."
        }
        accessibilityLabel={""}
      />
      <Divider />
      <CheckboxListItem
        value="Questa è un'altra prova ancora più lunga per andare su due righe"
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano."
        }
        accessibilityLabel={""}
      />
      <Divider />
      <CheckboxListItem
        icon="bonus"
        value="Let's try with a loooong loooooong looooooong title + icon"
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano."
        }
        accessibilityLabel={""}
      />
      <Divider />
      <CheckboxListItem
        icon="coggle"
        value="Usa configurazione rapida"
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti."
        }
        accessibilityLabel={""}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="CheckBoxListItem (disabled)">
      <CheckboxListItem
        disabled
        value="Usa configurazione rapida"
        accessibilityLabel={""}
      />
      <Divider />
      <CheckboxListItem
        disabled
        icon="coggle"
        value="Usa configurazione rapida"
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti."
        }
        accessibilityLabel={""}
      />
      <Divider />
      <CheckboxListItem
        disabled
        selected={true}
        icon="coggle"
        value="Usa configurazione rapida"
        accessibilityLabel={""}
      />
    </DSComponentViewerBox>
  </>
);

// RADIO ITEMS

const mockRadioItems = (): ReadonlyArray<NewRadioItem<string>> => [
  {
    icon: "coggle",
    value: "Let's try with a basic title",
    description:
      "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano.",
    id: "example-1"
  },
  {
    value: "Let's try with a basic title",
    description:
      "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti.",
    id: "example-2"
  },
  {
    value: "Let's try with a very looong loooooong title instead",
    id: "example-3"
  },
  {
    value: "Let's try with a disabled item",
    description:
      "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti.",
    id: "example-disabled",
    disabled: true
  }
];

const RadioListItemsShowroom = () => {
  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    "example-1"
  );

  return (
    <DSComponentViewerBox name="RadioListItem">
      <RadioGroup<string>
        key="check_income"
        items={mockRadioItems()}
        selectedItem={selectedItem}
        onPress={setSelectedItem}
      />
    </DSComponentViewerBox>
  );
};

// SWITCH

const renderAnimatedSwitch = () => (
  <DSComponentViewerBox name="AnimatedSwitch, dismissed in favor of the native one">
    <SwitchLabel label="This is a test" />
    <VSpacer size={16} />
    <SwitchLabel label="This is a test with a very loooong looooooong loooooooong text" />
  </DSComponentViewerBox>
);

const NativeSwitchShowroom = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <DSComponentViewerBox name="NativeSwitch">
      <View style={{ alignSelf: "flex-start" }}>
        <NativeSwitch value={isEnabled} onValueChange={toggleSwitch} />
      </View>
    </DSComponentViewerBox>
  );
};

const renderSwitchListItem = () => (
  <>
    <DSComponentViewerBox name="SwitchListItem">
      <SwitchListItem label="Testo molto breve" value={true} />
      <Divider />
      <SwitchListItem
        label="Testo molto breve"
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano."
        }
      />
      <Divider />
      <SwitchListItem
        label="Questa è un'altra prova ancora più lunga per andare su due righe"
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano."
        }
      />
      <Divider />
      <SwitchListItem
        icon="bonus"
        label="Let's try with a loooong loooooong looooooong title + icon"
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano."
        }
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="SwitchListItem, disabled">
      <SwitchListItem disabled label="Testo molto breve" value={true} />
      <Divider />
      <SwitchListItem
        disabled
        label="Testo molto breve"
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano."
        }
      />
      <Divider />
      <SwitchListItem
        disabled
        icon="bonus"
        label="Let's try with a loooong loooooong title + icon"
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano."
        }
      />
    </DSComponentViewerBox>
  </>
);
