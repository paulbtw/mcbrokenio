# McBroken

The project idea is inspired by [McBroken.com](https://mcbroken.com/) made by [rashiq](https://rashiq.me/).

## Features

- View the status of ice machines for McFlurry, McSundae, and milkshake products at McDonald's locations in the US, EU, and Australia.

## Built With
- [Serverless](https://www.serverless.com/)
- [Prisma](https://www.prisma.io/)
- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)

## Setup

1. You need to have basic tokens from the McDonald's app to use their API.
2. Fill out the .env.dist file and rename it to .env
3. Install all dependencies with `yarn install`
4. `docker-compose up` to start your local db
5. To run a function locally use `yarn mcall:local -f functionName`

## Information about the different McDonalds APIs.

you can find more information about the APIs [here](docs/API.md)





