import {
  AnimatedMessageCheckbox,
  BodySmall,
  CheckboxLabel,
  Divider,
  H4,
  HSpacer,
  IOColors,
  ListItemCheckbox,
  ListItemRadioWithAmount,
  ListItemSwitch,
  NativeSwitch,
  RadioGroup,
  RadioItem,
  useIOTheme,
  VStack
} from "@io-app/design-system";
import { ComponentProps, useState } from "react";
import { Alert, Text, View } from "react-native";

import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";

const sectionTitleMargin = 16;
const sectionMargin = 40;
const componentMargin = 32;
const componentInnerMargin = 8;

export const DSSelection = () => {
  const theme = useIOTheme();
  return (
    <DesignSystemScreen title={"Selection"}>
      <VStack space={sectionMargin}>
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Checkbox</H4>
          <VStack space={componentMargin}>
            {/* CheckboxLabel */}
            {renderCheckboxLabel()}
            {/* ListItemCheckbox */}
            {renderListItemCheckbox()}
          </VStack>
        </VStack>

        {/* AnimatedMessageCheckbox */}
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Checkbox (Messages)</H4>
          <AnimatedMessageCheckboxShowroom />
        </VStack>

        {/* RadioListItem */}
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Radio</H4>
          <RadioListItemsShowroom />
        </VStack>

        {/* Switch */}
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Switch</H4>
          <VStack space={componentMargin}>
            {/* Native Switch */}
            <NativeSwitchShowroom />
            {/* ListItemSwitch */}
            <ListItemSwitchShowroom />
          </VStack>
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

const renderCheckboxLabel = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="CheckboxLabel">
      <VStack space={componentInnerMargin}>
        <CheckboxLabel label="This is a test" />
        <CheckboxLabel label="This is a test with a very loooong looooooooong loooooooong text" />
      </VStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="CheckboxLabel (disabled)">
      <VStack space={componentInnerMargin}>
        <CheckboxLabel checked={true} disabled label="This is a test" />
        <CheckboxLabel disabled label="This is a test" />
      </VStack>
    </DSComponentViewerBox>
  </VStack>
);

const renderListItemCheckbox = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ListItemCheckbox">
      <ListItemCheckbox
        accessibilityLabel={""}
        value="Usa configurazione rapida"
      />
      <Divider />
      <ListItemCheckbox
        accessibilityLabel={""}
        icon="coggle"
        value="Usa configurazione rapida"
      />
      <Divider />
      <ListItemCheckbox
        accessibilityLabel={""}
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano."
        }
        value="Usa configurazione rapida"
      />
      <Divider />
      <ListItemCheckbox
        accessibilityLabel={""}
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano."
        }
        value="Questa è un'altra prova ancora più lunga per andare su due righe"
      />
      <Divider />
      <ListItemCheckbox
        accessibilityLabel={""}
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano."
        }
        icon="bonus"
        value="Let's try with a loooong loooooong looooooong title + icon"
      />
      <Divider />
      <ListItemCheckbox
        accessibilityLabel={""}
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti."
        }
        icon="coggle"
        value="Usa configurazione rapida"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemCheckbox (disabled)">
      <ListItemCheckbox
        accessibilityLabel={""}
        disabled
        value="Usa configurazione rapida"
      />
      <Divider />
      <ListItemCheckbox
        accessibilityLabel={""}
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti."
        }
        disabled
        icon="coggle"
        value="Usa configurazione rapida"
      />
      <Divider />
      <ListItemCheckbox
        accessibilityLabel={""}
        disabled
        icon="coggle"
        selected={true}
        value="Usa configurazione rapida"
      />
    </DSComponentViewerBox>
  </VStack>
);

// RADIO ITEMS

const mockRadioItems = (): ReadonlyArray<RadioItem<string>> => [
  {
    startImage: { icon: "coggle" },
    value: "Let's try with a basic title",
    description:
      "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano.",
    id: "example-1"
  },
  {
    value: "Let's try with JSX description",
    description: (
      <BodySmall color="grey-700" weight="Regular">
        Ti contatteranno solo i servizi che hanno qualcosa di importante da
        dirti.{" "}
        <Text style={{ color: IOColors["grey-700"], fontWeight: "600" }}>
          Potrai sempre disattivare le comunicazioni che non ti interessano.
        </Text>
      </BodySmall>
    ),
    id: "example-jsx-element"
  },
  {
    startImage: { paymentLogo: "myBank" },
    value: "Payment method item",
    description:
      "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano.",
    id: "example-paymentLogo"
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

const mockRadioItemsSkeleton = (): ReadonlyArray<RadioItem<string>> => [
  {
    value: "Skeleton example",
    description:
      "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti.",
    id: "example-loading",
    disabled: true,
    loadingProps: {
      state: true,
      skeletonIcon: false
    }
  },
  {
    value: "Skeleton example",
    description:
      "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti.",
    id: "example-loading-withIcon",
    disabled: true,
    loadingProps: {
      state: true,
      skeletonIcon: true
    }
  },
  {
    value: "Skeleton example",
    description:
      "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti.",
    id: "example-loading-withDescription",
    disabled: true,
    loadingProps: {
      state: true,
      skeletonDescription: true
    }
  },
  {
    value: "Skeleton example",
    description:
      "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti.",
    id: "example-loading-withIcon-withDescription",
    disabled: true,
    loadingProps: {
      state: true,
      skeletonDescription: true,
      skeletonIcon: true
    }
  }
];

const RadioListItemsShowroom = () => {
  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    "example-1"
  );

  return (
    <VStack space={componentMargin}>
      <DSComponentViewerBox name="RadioListItem">
        <RadioGroup<string>
          items={mockRadioItems()}
          key="check_income"
          onPress={setSelectedItem}
          selectedItem={selectedItem}
          type="radioListItem"
        />
      </DSComponentViewerBox>
      <DSComponentViewerBox name="RadioListItem, loading states">
        <RadioGroup<string>
          items={mockRadioItemsSkeleton()}
          key="skeleton"
          onPress={setSelectedItem}
          selectedItem={selectedItem}
          type="radioListItem"
        />
      </DSComponentViewerBox>
      <DSComponentViewerBox name="ListItemRadioWithAmount">
        <ListItemRadioWithAmount
          formattedAmountString={"2,50 €"}
          isSuggested={true}
          label="Banca Intesa"
          suggestReason="Perché sei già cliente"
        />
        <Divider />
        <ListItemRadioWithAmount
          formattedAmountString={"4,50 €"}
          label="Banca un po' costosa"
        />
      </DSComponentViewerBox>
    </VStack>
  );
};

const AnimatedMessageCheckboxShowroom = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <DSComponentViewerBox name="AnimatedMessageCheckbox">
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <AnimatedMessageCheckbox checked={isEnabled} />
        <HSpacer size={24} />
        <NativeSwitch onValueChange={toggleSwitch} value={isEnabled} />
      </View>
    </DSComponentViewerBox>
  );
};

// SWITCH
const NativeSwitchShowroom = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <DSComponentViewerBox name="NativeSwitch">
      <View style={{ alignSelf: "flex-start" }}>
        <NativeSwitch onValueChange={toggleSwitch} value={isEnabled} />
      </View>
    </DSComponentViewerBox>
  );
};

type ListItemSwitchSampleProps = Pick<
  ComponentProps<typeof ListItemSwitch>,
  "action" | "description" | "icon" | "label" | "paymentLogo" | "value"
>;

const ListItemSwitchSample = ({
  value,
  label,
  description,
  icon,
  action,
  paymentLogo
}: ListItemSwitchSampleProps) => {
  const [isEnabled, setIsEnabled] = useState(value);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <>
      {icon ? (
        <ListItemSwitch
          action={action}
          description={description}
          icon={icon}
          label={label}
          onSwitchValueChange={toggleSwitch}
          value={isEnabled}
        />
      ) : paymentLogo ? (
        <ListItemSwitch
          action={action}
          description={description}
          label={label}
          onSwitchValueChange={toggleSwitch}
          paymentLogo={paymentLogo}
          value={isEnabled}
        />
      ) : (
        <ListItemSwitch
          action={action}
          description={description}
          label={label}
          onSwitchValueChange={toggleSwitch}
          value={isEnabled}
        />
      )}
    </>
  );
};

const ListItemSwitchShowroom = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="ListItemSwitch">
      <ListItemSwitchSample label="Testo molto breve" value={true} />
      <Divider />
      <ListItemSwitchSample
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano."
        }
        label="Testo molto breve"
      />
      <Divider />
      <ListItemSwitchSample
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano."
        }
        label="Questa è un'altra prova ancora più lunga per andare su due righe"
      />
      <Divider />
      <ListItemSwitchSample
        action={{
          label: "Action",
          onPress: () => {
            Alert.alert("Action triggered!");
          }
        }}
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano."
        }
        icon="bonus"
        label="Let's try with a loooong loooooong title + icon + action"
      />
      <Divider />
      <ListItemSwitchSample
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano."
        }
        icon="bonus"
        label="Let's try with a loooong loooooong title + icon"
      />
      <Divider />
      <ListItemSwitchSample
        label="5354 **** **** 0000"
        paymentLogo="mastercard"
      />
      <Divider />
      <ListItemSwitchSample label="Apple Pay" paymentLogo="applePay" />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemSwitch, loading status">
      <ListItemSwitch
        description="Loading list item switch"
        icon="device"
        isLoading
        label="Label"
        value={false}
      />
      <Divider />
      <ListItemSwitch
        description="Loading list item switch"
        icon="device"
        isLoading
        label="Loong loooooong looooooooong loooong title"
        value={false}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemSwitch with badge">
      <ListItemSwitch
        badge={{
          text: "Attivo",
          variant: "highlight"
        }}
        description="Inquadra il codice QR mostrato dall’esercente e segui le istruzioni in app per autorizzare la spesa."
        icon="device"
        label="Usa l'app IO"
        value={false}
      />
      <Divider />
      <ListItemSwitch
        badge={{
          text: "Attivo",
          variant: "highlight"
        }}
        icon="coggle"
        label="Loong loooooong loooooooooong loooong title"
        value={false}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ListItemSwitch, disabled">
      <ListItemSwitch disabled label="Testo molto breve" value={true} />
      <Divider />
      <ListItemSwitch
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano."
        }
        disabled
        label="Testo molto breve"
      />
      <Divider />
      <ListItemSwitch
        description={
          "Ti contatteranno solo i servizi che hanno qualcosa di importante da dirti. Potrai sempre disattivare le comunicazioni che non ti interessano."
        }
        disabled
        icon="bonus"
        label="Let's try with a loooong loooooong title + icon"
      />
    </DSComponentViewerBox>
  </VStack>
);
