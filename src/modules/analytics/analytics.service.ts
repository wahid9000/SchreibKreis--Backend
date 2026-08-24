import { prisma } from "../../lib/prisma";

const rangeToDays = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
} as const;

type AnalyticsRange = keyof typeof rangeToDays | "all";

const getStartDate = (range: AnalyticsRange, now: Date) => {
  if (range === "all") return undefined;

  const startDate = new Date(now);
  startDate.setUTCDate(startDate.getUTCDate() - rangeToDays[range]);
  return startDate;
};

const getDayKey = (date: Date) => date.toISOString().slice(0, 10);

const getAnalytics = async (range: AnalyticsRange = "30d") => {
  const now = new Date();
  const startDate = getStartDate(range, now);
  const previousStartDate = startDate
    ? new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
    : undefined;
  const currentDateFilter = startDate ? { createdAt: { gte: startDate } } : {};
  const previousDateFilter =
    previousStartDate && startDate
      ? { createdAt: { gte: previousStartDate, lt: startDate } }
      : null;

  const [
    totalUsers,
    totalPosts,
    publishedPosts,
    totalViews,
    totalComments,
    approvedComments,
    activeUsers,
    currentUsers,
    currentPosts,
    currentComments,
    previousUsers,
    previousPosts,
    previousComments,
    postStatusBreakdown,
    topPosts,
    recentPosts,
    recentComments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.aggregate({ _sum: { views: true } }),
    prisma.comment.count(),
    prisma.comment.count({ where: { status: "APPROVED" } }),
    prisma.session.count({ where: { expiresAt: { gt: now } } }),
    prisma.user.findMany({
      where: currentDateFilter,
      select: { createdAt: true },
    }),
    prisma.post.findMany({
      where: currentDateFilter,
      select: { createdAt: true },
    }),
    prisma.comment.findMany({
      where: currentDateFilter,
      select: { createdAt: true },
    }),
    previousDateFilter
      ? prisma.user.count({ where: previousDateFilter })
      : Promise.resolve(null),
    previousDateFilter
      ? prisma.post.count({ where: previousDateFilter })
      : Promise.resolve(null),
    previousDateFilter
      ? prisma.comment.count({ where: previousDateFilter })
      : Promise.resolve(null),
    Promise.all([
      prisma.post.count({ where: { status: "DRAFT" } }),
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.post.count({ where: { status: "ARCHIVED" } }),
    ]),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ views: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        views: true,
        createdAt: true,
        _count: { select: { comments: true } },
      },
    }),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, createdAt: true },
    }),
    prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        postId: true,
        authorId: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const trendMap = new Map<
    string,
    { newUsers: number; newPosts: number; newComments: number }
  >();
  const trendStart =
    startDate ??
    new Date(
      Math.min(
        ...[...currentUsers, ...currentPosts, ...currentComments].map((item) =>
          item.createdAt.getTime(),
        ),
        now.getTime(),
      ),
    );
  const trendDate = new Date(trendStart);
  trendDate.setUTCHours(0, 0, 0, 0);
  while (trendDate <= now) {
    trendMap.set(getDayKey(trendDate), {
      newUsers: 0,
      newPosts: 0,
      newComments: 0,
    });
    trendDate.setUTCDate(trendDate.getUTCDate() + 1);
  }

  currentUsers.forEach(
    ({ createdAt }) => trendMap.get(getDayKey(createdAt))!.newUsers++,
  );
  currentPosts.forEach(
    ({ createdAt }) => trendMap.get(getDayKey(createdAt))!.newPosts++,
  );
  currentComments.forEach(
    ({ createdAt }) => trendMap.get(getDayKey(createdAt))!.newComments++,
  );

  const percentChange = (current: number, previous: number | null) => {
    if (previous === null) return null;
    if (previous === 0) return current === 0 ? 0 : 100;
    return Math.round(((current - previous) / previous) * 10000) / 100;
  };

  const currentViews = totalViews._sum.views ?? 0;
  const statusCounts = {
    DRAFT: postStatusBreakdown[0],
    PUBLISHED: postStatusBreakdown[1],
    ARCHIVED: postStatusBreakdown[2],
  };

  return {
    generatedAt: now.toISOString(),
    range,
    overview: {
      totalUsers,
      totalPosts,
      publishedPosts,
      totalViews: currentViews,
      totalComments,
      approvedComments,
      activeUsers,
      averageViewsPerPublishedPost: publishedPosts
        ? Math.round(currentViews / publishedPosts)
        : 0,
      commentApprovalRate: totalComments
        ? Math.round((approvedComments / totalComments) * 10000) / 100
        : 0,
      changes: {
        users: percentChange(currentUsers.length, previousUsers),
        posts: percentChange(currentPosts.length, previousPosts),
        comments: percentChange(currentComments.length, previousComments),
      },
    },
    trends: [...trendMap].map(([date, values]) => ({ date, ...values })),
    postStatusBreakdown: Object.entries(statusCounts).map(
      ([status, count]) => ({ status, count }),
    ),
    topPosts: topPosts.map((post) => ({
      ...post,
      commentCount: post._count.comments,
      _count: undefined,
    })),
    recentActivity: [
      ...recentPosts.map((post) => ({
        type: "POST_CREATED",
        id: post.id,
        title: post.title,
        status: post.status,
        createdAt: post.createdAt,
      })),
      ...recentComments.map((comment) => ({
        type: "COMMENT_CREATED",
        ...comment,
      })),
    ]
      .sort(
        (first, second) =>
          second.createdAt.getTime() - first.createdAt.getTime(),
      )
      .slice(0, 10),
  };
};

export const analyticsService = {
  getAnalytics,
};
