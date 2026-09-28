import { prisma } from "../../lib/prisma";

type UpdateUserInput = {
  name?: string;
  phone?: string | null;
};

const updateUser = (userId: string, data: UpdateUserInput) =>
  prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      updatedAt: true,
    },
  });

export const userService = {
  updateUser,
};
