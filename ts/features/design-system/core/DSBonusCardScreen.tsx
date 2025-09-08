import {
  Body,
  ContentWrapper,
  Tag,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Alert } from "react-native";
import I18n from "i18next";
import { BonusCardScreenComponent } from "../../../components/BonusCard";

const DSBonusCardScreen = () => (
  <BonusCardScreenComponent
    logoUris={[
      {
        uri: "https://vtlogo.com/wp-content/uploads/2021/08/18app-vector-logo.png"
      }
    ]}
    name="18app"
    organizationName="Ministero della Cultura"
    status={<Tag variant="info" text={I18n.t("bonusCard.paused")} />}
    counters={[
      {
        type: "ValueWithProgress",
        label: "Disponibile",
        value: "9.999,99 €",
        progress: 0.2
      },
      {
        type: "Value",
        label: "Da rimborsare",
        value: "9.999,99 €"
      }
    ]}
    headerAction={{
      icon: "info",
      onPress: () => {
        Alert.alert("info");
      },
      accessibilityLabel: "info"
    }}
    actions={{
      type: "SingleButton",
      primary: {
        label: "Autorizza una transazione",
        accessibilityLabel: "Autorizza una transazione",
        onPress: () => Alert.alert("Autorizzata!")
      }
    }}
  >
    <VSpacer size={16} />
    <ContentWrapper>
      <Body>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </Body>
      <VSpacer size={16} />
      <Body>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
        accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
        illo inventore veritatis et quasi architecto beatae vitae dicta sunt
        explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut
        odit aut fugit, sed quia consequuntur magni dolores eos qui ratione
        voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum
        quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam
        eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat
        voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam
        corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?
        Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse
        quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo
        voluptas nulla pariatur?
      </Body>
    </ContentWrapper>
  </BonusCardScreenComponent>
);

export { DSBonusCardScreen };
