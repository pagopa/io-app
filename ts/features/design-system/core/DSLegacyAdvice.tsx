import { Body, Icon, VSpacer } from "@pagopa/io-app-design-system";

/* Types */
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSLegacyAdvice = () => (
  <DesignSystemScreen title={"Advice & Banners"}>
    <InfoScreenComponent
      image={<Icon name="info" />}
      title={"Title"}
      body={
        <Body style={{ textAlign: "center" }}>
          Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do eiusmod
          tempor incidunt ut labore et dolore magna aliqua.
        </Body>
      }
    />
    <VSpacer size={24} />
    <VSpacer size={40} />
  </DesignSystemScreen>
);
