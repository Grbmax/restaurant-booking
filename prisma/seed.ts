import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("test", 12);
  const user = await prisma.user.upsert({
    where: { email: "gaurav@code-b.in" },
    update: {},
    create: {
      email: "gaurav@code-b.in",
      name: "Gaurav",
      role: "admin",
      image: 'URL',
      password,
    },
  });

  console.log({ user });
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
