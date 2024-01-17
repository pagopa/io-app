import React from "react";
import { H1 } from "../../../../components/core/typography/H1";

type MessageTitleProps = {
  title: string;
};

export const MessageTitle = ({ title }: MessageTitleProps) => <H1>{title}</H1>;
