import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("test", 12);
  const admin_user = await prisma.user.upsert({
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

  const owner = await prisma.user.upsert({
    where: { email: "owner@test.com" },
    update: {},
    create: {
      email: "owner@test.com",
      role: "owner",
      name: "Owner",
      image: 'URL',
      password,
    },
  });
  
  const user = await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: {},
    create: {
      email: "test@test.com",
      name: "Test",
      image: 'URL',
      password,
    },
  });

  const admin_resto = await prisma.restaurant.create({
    data: {
      userId: admin_user.userId,
      name: "Test",
      role: admin_user.role
    }
  })

  const owner_resto = await prisma.restaurant.create({
    data: {
      userId: owner.userId,
      name: "Test",
      role: admin_user.role
    }
  })


  console.log({ admin_user });
  console.log({ owner });
  console.log({ user });
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
