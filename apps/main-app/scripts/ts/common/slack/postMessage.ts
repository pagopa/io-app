export const slackPostMessage = async (
  _text: string,
  _channel: string,
  _unfurlMessage = true
): Promise<unknown> => {
  throw new Error(
    "slackPostMessage must not be called from the client-side application bundle. Slack API operations should be performed on a secure backend server."
  );
};
