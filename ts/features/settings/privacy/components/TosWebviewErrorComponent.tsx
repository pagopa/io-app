import {
  ContentWrapper,
  FooterActions,
  H3,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";

type TosWebviewErrorComponentProps = {
  handleRetry: () => void;
};

const TosWebviewErrorComponent = ({
  handleRetry
}: TosWebviewErrorComponentProps) => (
  <>
    {/* TODO: We should consider replacing this with `IOSCrollView` */}
    <ContentWrapper
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
      }}
      testID="toSErrorContainerView"
    >
      <Pictogram name="stopSecurity" />
      <VSpacer size={8} />
      <H3 testID="toSErrorContainerTitle" style={{ textAlign: "center" }}>
        {I18n.t("onboarding.tos.error")}
      </H3>
    </ContentWrapper>
    <FooterActions
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("global.buttons.retry"),
          onPress: handleRetry,
          testID: "RetryButtonTest"
        }
      }}
    />
  </>
);
export default TosWebviewErrorComponent;
