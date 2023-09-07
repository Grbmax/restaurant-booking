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
      image: "URL",
      password,
    },
  });

  const admin_user2 = await prisma.user.upsert({
    where: { email: "admin@code-b.in" },
    update: {},
    create: {
      email: "admin@code-b.in",
      name: "Admin",
      role: "admin",
      image: "URL",
      password,
    },
  });

  const admin_user3 = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      name: "Admin Test",
      role: "admin",
      image: "URL",
      password,
    },
  });

  const owner1 = await prisma.user.upsert({
    where: { email: "owner1@test.com" },
    update: {},
    create: {
      email: "owner1@test.com",
      role: "owner",
      name: "Owner 1",
      image: "URL",
      password,
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: "owner2@test.com" },
    update: {},
    create: {
      email: "owner2@test.com",
      role: "owner",
      name: "Owner 2",
      image: "URL",
      password,
    },
  });

  const owner3 = await prisma.user.upsert({
    where: { email: "owner3@test.com" },
    update: {},
    create: {
      email: "owner3@test.com",
      role: "owner",
      name: "Owner 3",
      image: "URL",
      password,
    },
  });


  const resto1 = await prisma.restaurant.create({
    data: {
      name: "Restaurant 1",
      isActive: true,
      adminId: admin_user.userId,
      owners: {
        connect: [{ userId: owner1.userId }, { userId: owner2.userId }],
      },
    },
    include: {
      owners: true
    }
  });

  const resto2 = await prisma.restaurant.create({
    data: {
      name: "Restaurant 2",
      isActive: true,
      adminId: admin_user.userId,
      owners: { connect: [{ userId: owner1.userId }] },
    },
    include: {
      owners: true
    }
  });

  const resto3 = await prisma.restaurant.create({
    data: {
      name: "Restaurant 3",
      isActive: true,
      adminId: admin_user2.userId,
      owners: { connect: [{ userId: owner1.userId }] },
    },
    include: {
      owners: true
    }
  });

  const user = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      email: "user@test.com",
      name: "User",
      image: "URL",
      password,
    },
  });

  console.log("Admin 1: ", { admin_user });
  console.log("Admin 2: ", { admin_user2 });
  console.log("Owner 1: ", { owner1 });
  console.log("Owner 2: ", { owner2 });
  console.log("User: ", { user });
  console.log("Restaurant 1: ", { resto1 });
  console.log("Restaurant 2: ", { resto2 });
  console.log("Restaurant 3: ", { resto3 });
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
