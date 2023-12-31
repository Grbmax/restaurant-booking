This is a restaurant booking web-application which provides API's for a front-end to consume. The application supports an admin/restaurant panel to manage restaurants, owners, and bookings.
Stack : [ Next.js13, NextAuth, PrismaORM, Planetscale (remote MySQL sv), TailwindCSS, shadcnUI ]

## Getting Started

First, install the dependencies:

```bash
yarn install
```
Next, setup PRISMA as required(PRISMA SETUP): 
```bash
npx prisma generate
```
(If schema isn't on the remote DB)
```
npx prisma db push
```
(Seed the db with pre-existing data if needed)
```
npx prisma db seed 
```

Finally, run the development server:
```bash
yarn run dev
```

Make sure you create an enviornment variable file to store the DB_URL, NextAuth SECRET, NextAuth URL, and any other necessary data.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
