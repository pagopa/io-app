// import CookieManager from "@react-native-community/cookies";
import { Content } from "native-base";
import * as React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import RegionServiceWebView from "../../components/RegionServiceWebView";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { navigateBack } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  flex: { flex: 1 }
});

const ServicesWebviewScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  React.useEffect(() => {
    // CookieManager.set();
  });

  return (
    <BaseScreenComponent goBack={true}>
      <SafeAreaView style={styles.flex}>
        <Content contentContainerStyle={styles.flex}>
          <RegionServiceWebView uri={props.uri} onModalClose={props.goBack} />
        </Content>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
const mapStateToProps = (state: GlobalState) => {
  return {
    uri: "",
    tokenName: "walletToken"
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => dispatch(navigateBack())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServicesWebviewScreen);
