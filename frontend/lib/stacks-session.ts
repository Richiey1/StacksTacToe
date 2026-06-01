// App details used across wallet connection flows
export const appDetails = {
  name: "StacksTacToe",
  icon: typeof window !== "undefined"
    ? new URL("/favicon.ico", window.location.origin).toString()
    : "/favicon.ico",
};
