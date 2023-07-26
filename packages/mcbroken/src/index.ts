import { RandomFunction } from '@mcb/core/test';

export const run = () => {
  const time = new Date();
  console.log(`Your cron function ran at ${time}`);
  RandomFunction();
};
