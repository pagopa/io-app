import * as React from "react";
import { View, StyleSheet } from "react-native";
import AdviceComponent from "../../../components/AdviceComponent";
import StatusContent from "../../../components/SectionStatus/StatusContent";
import SectionStatusComponent, {
  getStatusTextColor,
  statusColorMap,
  statusIconMap
} from "../../../components/SectionStatus";
import { DSFullWidthComponent } from "../components/DSFullWidthComponent";
import { InfoBox } from "../../../components/box/InfoBox";
import { Body } from "../../../components/core/typography/Body";

/* Types */
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { LevelEnum } from "../../../../definitions/content/SectionStatus";
import { Icon } from "../../../components/core/icons";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { H5 } from "../../../components/core/typography/H5";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H2 } from "../../../components/core/typography/H2";
import { Alert } from "../../../components/Alert";

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: "100%",
    justifySelf: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around"
  }
});

export const DSAlert = () => {
  const viewRef = React.createRef<View>();

  return (
    <DesignSystemScreen title={"Alert"}>
      {/* Content only */}
      <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
        Content only
      </H2>
      <Alert
        viewRef={viewRef}
        variant="error"
        content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      />

      <VSpacer />

      <Alert
        viewRef={viewRef}
        variant="warning"
        content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      />

      <VSpacer />

      <Alert
        viewRef={viewRef}
        variant="info"
        content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      />

      <VSpacer />

      <Alert
        viewRef={viewRef}
        variant="success"
        content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      />

      <VSpacer size={40} />

      <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
        Title + Content
      </H2>

      <Alert
        viewRef={viewRef}
        variant="error"
        title="Alert title"
        content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      />

      <VSpacer />

      <Alert
        viewRef={viewRef}
        variant="warning"
        title="Alert title"
        content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      />

      <VSpacer />

      <Alert
        viewRef={viewRef}
        variant="info"
        title="Alert title"
        content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      />

      <VSpacer />

      <Alert
        viewRef={viewRef}
        variant="success"
        title="Alert title"
        content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      />

      <VSpacer />

      <Alert
        viewRef={viewRef}
        variant="info"
        title="A very very very looooooooooong title"
        content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      />

      <VSpacer size={40} />

      <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
        Content + Action
      </H2>

      <Alert
        viewRef={viewRef}
        variant="error"
        action="Alert action"
        onPress={() => {
          alert("Action triggered");
        }}
        content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      />

      <VSpacer />

      <Alert
        viewRef={viewRef}
        variant="warning"
        action="Alert action"
        onPress={() => {
          alert("Action triggered");
        }}
        content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      />

      <VSpacer />

      <Alert
        viewRef={viewRef}
        variant="info"
        action="Alert action"
        onPress={() => {
          alert("Action triggered");
        }}
        content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      />

      <VSpacer />

      <Alert
        viewRef={viewRef}
        variant="success"
        action="Alert action"
        onPress={() => {
          alert("Action triggered");
        }}
        content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
      />

      <VSpacer size={40} />

      {/* Full width */}
      <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
        Full width
      </H2>
      <DSFullWidthComponent>
        <Alert
          fullWidth
          viewRef={viewRef}
          variant="error"
          content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
        />

        <VSpacer />

        <Alert
          fullWidth
          viewRef={viewRef}
          variant="warning"
          content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
        />

        <VSpacer />

        <Alert
          fullWidth
          viewRef={viewRef}
          variant="info"
          content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
        />

        <VSpacer />

        <Alert
          fullWidth
          viewRef={viewRef}
          variant="success"
          content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
        />

        <VSpacer />

        <Alert
          fullWidth
          viewRef={viewRef}
          variant="info"
          title="Alert title"
          content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
        />

        <VSpacer />

        <Alert
          fullWidth
          viewRef={viewRef}
          variant="info"
          action="Alert action"
          onPress={() => {
            alert("Action triggered");
          }}
          content="Ut enim ad minim veniam, quis ullamco labo nisi ut aliquid ad minim veniam"
        />
      </DSFullWidthComponent>

      <VSpacer size={24} />

      <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
        Legacy components
      </H2>
      <AdviceComponent
        text={
          "Dopo questo passaggio non sarà più possibile annullare il pagamento."
        }
      />
      <VSpacer size={16} />
      <View style={[styles.content, IOStyles.horizontalContentPadding]}>
        <InfoBox>
          <Body>
            Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do
            eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad
            minim veniam, quis nostrum exercitationem ullamco laboriosam, nisi
            ut aliquid ex ea commodi consequatur.
          </Body>
        </InfoBox>
      </View>
      <InfoBox iconSize={24} iconColor="bluegreyDark">
        <H5 weight={"Regular"}>
          {
            "Per verificare la tua carta, tratteniamo € 0.02. Non preoccuparti: ti restituiremo l'importo al più presto."
          }
        </H5>
      </InfoBox>
      <InfoScreenComponent
        image={<Icon name="info" />}
        title={"Title"}
        body={
          <Body style={{ textAlign: "center" }}>
            Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do
            eiusmod tempor incidunt ut labore et dolore magna aliqua.
          </Body>
        }
      />
      <VSpacer size={16} />
      <DSFullWidthComponent>
        <StatusContent
          accessibilityLabel={`Accessibility text for the advice component`}
          backgroundColor={statusColorMap.normal}
          foregroundColor={getStatusTextColor(LevelEnum.normal)}
          iconName={statusIconMap.normal}
          testID={"SectionStatusComponentContent"}
          viewRef={viewRef}
        >
          {
            "L’invio dei Certificati Verdi è in corso e potrebbe richiedere diversi giorni."
          }
        </StatusContent>
      </DSFullWidthComponent>
      <VSpacer size={16} />
      <DSFullWidthComponent>
        <SectionStatusComponent sectionKey={"favourite_language"} />
      </DSFullWidthComponent>
      <VSpacer size={16} />
      <DSFullWidthComponent>
        <StatusContent
          accessibilityLabel={`Accessibility text for the advice component`}
          backgroundColor={statusColorMap.warning}
          foregroundColor={getStatusTextColor(LevelEnum.warning)}
          iconName={statusIconMap.warning}
          testID={"SectionStatusComponentContent"}
          viewRef={viewRef}
        >
          {"La sezione Messaggi è in manutenzione, tornerà operativa a breve"}
        </StatusContent>
      </DSFullWidthComponent>
      <VSpacer size={16} />
      <DSFullWidthComponent>
        <StatusContent
          accessibilityLabel={`Accessibility text for the advice component`}
          backgroundColor={statusColorMap.critical}
          foregroundColor={getStatusTextColor(LevelEnum.critical)}
          iconName={statusIconMap.critical}
          testID={"SectionStatusComponentContent"}
          viewRef={viewRef}
        >
          {
            "I nostri sistemi potrebbero rispondere con lentezza, ci scusiamo per il disagio."
          }
        </StatusContent>
      </DSFullWidthComponent>
      <VSpacer size={16} />
      <VSpacer size={40} />
    </DesignSystemScreen>
  );
};
