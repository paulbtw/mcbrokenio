// eslint-disable-next-line no-promise-executor-return
export const delay = async (time: number) => new Promise((resolve) => setTimeout(resolve, time));
