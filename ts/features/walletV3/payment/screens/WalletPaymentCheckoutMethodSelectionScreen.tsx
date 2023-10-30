import {
  ButtonSolid,
  GradientScrollView,
  H2,
  H6,
  HeaderSecondLevel,
  IOLogoPaymentType,
  RadioGroup,
  RadioItem,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { View } from "react-native";
import TypedI18n from "../../../../i18n";

const ListItemHeading = (props: { text: string }) => (
  // FIXME:: needs new DS component
  <View style={{ paddingVertical: 16 }}>
    <H6>{props.text}</H6>
  </View>
);

type PaymenMethod = {
  icon: IOLogoPaymentType;
  name: string;
};

const savedMethods: Array<PaymenMethod> = [
  {
    icon: "amex",
    name: "amex ***1"
  },
  {
    icon: "amex",
    name: "amex ***2e"
  },
  {
    icon: "amex",
    name: "amex ***3"
  }
];

const notSavedMethods: Array<PaymenMethod> = [
  {
    icon: "amex",
    name: "amex ***4"
  },
  {
    icon: "amex",
    name: "amex ***5"
  },
  {
    icon: "amex",
    name: "amex ***6"
  }
];

const mapToRadioGroupItems = (
  items: Array<PaymenMethod>
): Array<RadioItem<number>> =>
  items.map((item, index) => ({
    id: index,
    value: item.name,
    icon: "creditCard"
  }));

export const WalletCheckoutMethodSelectionScreen = () => {
  const [selectedIndex, setSelectedIndex] = React.useState<number | undefined>(
    undefined
  );
  const navigation = useNavigation();

  // eslint-disable-next-line no-console
  const footerOnPress = () => console.log("clicked: ", selectedIndex);
  return (
    <>
      <HeaderSecondLevel
        backAccessibilityLabel={TypedI18n.t("global.buttons.back")}
        goBack={navigation.goBack}
        title=""
        type="base"
      />
      <GradientScrollView
        primaryAction={
          selectedIndex !== undefined && (
            <ButtonSolid
              label={TypedI18n.t("global.buttons.continue")}
              fullWidth
              accessibilityLabel={TypedI18n.t("global.buttons.continue")}
              onPress={footerOnPress}
            />
          )
        }
      >
        <H2>{TypedI18n.t("wallet.pickPaymentMethod.header")}</H2>
        <VSpacer size={16} />
        <ListItemHeading
          text={TypedI18n.t("wallet.pickPaymentMethod.savedMethods")}
        />
        {/* FIXME:: needs to accept payment method icons with fallback, possibly with custom left component */}
        <RadioGroup
          items={mapToRadioGroupItems(savedMethods)}
          onPress={index => setSelectedIndex(index)}
          selectedItem={selectedIndex}
        />
        <ListItemHeading
          text={TypedI18n.t("wallet.pickPaymentMethod.otherMethods")}
        />
        <RadioGroup
          items={mapToRadioGroupItems(notSavedMethods)}
          onPress={index => setSelectedIndex(savedMethods.length + index)}
          selectedItem={
            selectedIndex !== undefined
              ? selectedIndex - savedMethods.length
              : undefined
          }
        />
      </GradientScrollView>
    </>
  );
};
