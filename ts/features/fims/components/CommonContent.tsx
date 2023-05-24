import { Body, Container, Content, Right } from "native-base";
import * as React from "react";
import AppHeader from "../../../components/ui/AppHeader";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { Icon } from "../../../components/core/icons/Icon";

type Props = {
  close: () => void;
  children: React.ReactNode;
};

const CommonContent = ({ close, children }: Props) => (
  <Container>
    <AppHeader noLeft={true}>
      <Body />
      <Right>
        <ButtonDefaultOpacity onPress={close} transparent={true}>
          <Icon name="close" />
        </ButtonDefaultOpacity>
      </Right>
    </AppHeader>
    <Content style={IOStyles.flex}>{children}</Content>
  </Container>
);

export default CommonContent;
