import { coreFunction } from "@mcbroken/core"

export const hello = async () => {
  const test = coreFunction()

  console.log('Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!' + test,)
};
