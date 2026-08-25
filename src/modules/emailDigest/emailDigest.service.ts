import { emailService } from "../../lib/emailService";
import { prisma } from "../../lib/prisma";

const sendWeeklyDigestService = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const topPosts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      createdAt: { gte: sevenDaysAgo },
    },
    orderBy: { views: "desc" },
    take: 10,
    select: {
      id: true,
      title: true,
      thumbnail: true,
      createdAt: true,
      views: true,
      authorId: true,
    },
  });

  if (topPosts.length === 0) {
    return { sent: 0, failed: 0, message: "No posts found for this week" };
  }

  const users = await prisma.user.findMany({
    where: { emailVerified: true },
    select: { email: true, name: true },
  });

  return emailService.sendDigestMail({
    users,
    posts: topPosts,
    appName: "Schreibkreis",
  });
};

export const emailDigestService = {
  sendWeeklyDigestService,
};
