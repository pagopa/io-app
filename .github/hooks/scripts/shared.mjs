/** Reads the hook payload and switches to its working directory. */
export const readPayload = async () => {
  let input = "";
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  if (!input.trim()) {
    throw new Error("Copilot hook payload is empty");
  }

  const payload = JSON.parse(input);
  process.chdir(payload.cwd ?? process.cwd());
  return payload;
};
