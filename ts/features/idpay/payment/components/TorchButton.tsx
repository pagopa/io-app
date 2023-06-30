import React from "react";
import { useTorch } from "../../../../hooks/useTorch";
import IconButton from "../../../../components/ui/IconButton";

const TorchButton = () => {
  const { isOn, toggle } = useTorch();

  return (
    <IconButton
      testID="flashlightButtonTestID"
      accessibilityLabel="flash"
      icon={isOn ? "lightFilled" : "light"}
      onPress={toggle}
      color="contrast"
    />
  );
};

export { TorchButton };
