import * as React from "react";
import { Alert, View, ImageSourcePropType } from "react-native";
import {
  IOThemeContext,
  ModuleIDP,
  ModulePaymentNotice,
  PaymentNoticeStatus,
  VSpacer
} from "@pagopa/io-app-design-system";
import { getBadgeTextByPaymentNoticeStatus } from "../../messages/utils/strings";
import { H2 } from "../../../components/core/typography/H2";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import ButtonExtendedOutline from "../../../components/ui/ButtonExtendedOutline";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

type PaymentNoticeStatusWithoutDefault = Exclude<
  PaymentNoticeStatus,
  "default"
>;

const noticeStatusArray: Array<PaymentNoticeStatusWithoutDefault> = [
  "paid",
  "error",
  "expired",
  "revoked",
  "canceled"
];

export const DSModules = () => (
  <IOThemeContext.Consumer>
    {theme => (
      <DesignSystemScreen title="Modules">
        <H2
          color={theme["textHeading-default"]}
          weight={"SemiBold"}
          style={{ marginBottom: 16 }}
        >
          ModulePaymentNotice
        </H2>
        {renderModulePaymentNotice()}

        <VSpacer size={40} />

        <H2
          color={theme["textHeading-default"]}
          weight={"SemiBold"}
          style={{ marginBottom: 16 }}
        >
          ButtonExtendedOutline
        </H2>
        {renderButtonExtendedOutline()}

        <VSpacer size={40} />

        <H2
          color={theme["textHeading-default"]}
          weight={"SemiBold"}
          style={{ marginBottom: 16 }}
        >
          ModuleIDP
        </H2>
        {renderModuleIDP()}
      </DesignSystemScreen>
    )}
  </IOThemeContext.Consumer>
);

const renderModulePaymentNotice = () => (
  <DSComponentViewerBox name="ModulePaymentNotice">
    <View>
      <ModulePaymentNotice
        title="Codice avviso"
        subtitle="9999 9999 9999 9999 99"
        paymentNoticeStatus="default"
        paymentNoticeAmount="1.000,00 €"
        isLoading={true}
        onPress={onButtonPress}
      />
      <VSpacer size={16} />
      <ModulePaymentNotice
        title="Codice avviso"
        subtitle="9999 9999 9999 9999 99"
        paymentNoticeStatus="default"
        paymentNoticeAmount="1.000,00 €"
        onPress={onButtonPress}
      />
      <VSpacer size={16} />

      {noticeStatusArray.map(
        (noticeStatus: PaymentNoticeStatusWithoutDefault) => (
          <React.Fragment key={`paymentNotice-${noticeStatus}`}>
            <ModulePaymentNotice
              title="Codice avviso"
              subtitle="9999 9999 9999 9999 99"
              paymentNoticeStatus={noticeStatus}
              badgeText={getBadgeTextByPaymentNoticeStatus(noticeStatus)}
              onPress={onButtonPress}
            />
            <VSpacer size={16} />
          </React.Fragment>
        )
      )}

      <ModulePaymentNotice
        subtitle="TARI 2023 - Rata 01"
        paymentNoticeStatus="default"
        paymentNoticeAmount="1.000,00 €"
        onPress={onButtonPress}
      />
    </View>
  </DSComponentViewerBox>
);

const renderButtonExtendedOutline = () => (
  <DSComponentViewerBox name="ButtonExtendedOutline (using Pressable API)">
    <View>
      <ButtonExtendedOutline
        label={"Label name"}
        description={"This is a description of the element"}
        onPress={() => {
          alert("Action triggered");
        }}
      />
    </View>
    <VSpacer size={16} />
    <View>
      <ButtonExtendedOutline
        icon="chevronRight"
        label={"Label only"}
        onPress={() => {
          alert("Action triggered");
        }}
      />
    </View>
  </DSComponentViewerBox>
);

const mockIDPProviderItem = {
  id: "posteid",
  name: "Poste ID",
  logo: "",
  localLogo: require("../../../../img/spid-idp-posteid.png"),
  profileUrl: "https://posteid.poste.it/private/cruscotto.shtml"
};

const renderModuleIDP = () => (
  <>
    <DSComponentViewerBox name="ModuleIDP, default variant">
      <View>
        <ModuleIDP
          name={mockIDPProviderItem.name}
          logo={mockIDPProviderItem.logo as ImageSourcePropType}
          localLogo={mockIDPProviderItem.localLogo as ImageSourcePropType}
          onPress={onButtonPress}
          testID={`idp-${mockIDPProviderItem.id}-button`}
        />
      </View>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleIDP, saved variant">
      <View>
        <ModuleIDP
          saved
          name={mockIDPProviderItem.name}
          logo={mockIDPProviderItem.logo as ImageSourcePropType}
          localLogo={mockIDPProviderItem.localLogo as ImageSourcePropType}
          onPress={onButtonPress}
          testID={`idp-${mockIDPProviderItem.id}-button`}
        />
      </View>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="ModuleIDP, default variant, stress test">
      <View>
        <ModuleIDP
          name={"This is a very loooooong IDP provider name"}
          logo={mockIDPProviderItem.logo as ImageSourcePropType}
          localLogo={mockIDPProviderItem.localLogo as ImageSourcePropType}
          onPress={onButtonPress}
          testID={`idp-${mockIDPProviderItem.id}-button`}
        />
      </View>
    </DSComponentViewerBox>
  </>
);
