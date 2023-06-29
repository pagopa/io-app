import React from "react";
import { useFlashlight } from "../../../../utils/hooks/useFlashlight";
import IconButton from "../../../../components/ui/IconButton";

const FlashlightButton = () => {
  const { isOn, toggle } = useFlashlight();

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

export { FlashlightButton };
