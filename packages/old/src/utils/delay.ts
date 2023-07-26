// eslint-disable-next-line no-promise-executor-return
export const delay = async (time: number) =>
  // eslint-disable-next-line no-promise-executor-return
  new Promise((resolve) => setTimeout(resolve, time));
