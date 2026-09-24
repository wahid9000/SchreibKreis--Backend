-- Preserve posts whose legacy author no longer exists in Better Auth.
INSERT INTO
    "user" (
        "id",
        "name",
        "email",
        "updatedAt"
    )
SELECT DISTINCT
    p."authorId",
    'Legacy author',
    'legacy-author-' || md5(p."authorId") || '@invalid.local',
    CURRENT_TIMESTAMP
FROM "posts" p
WHERE
    NOT EXISTS (
        SELECT 1
        FROM "user" u
        WHERE
            u."id" = p."authorId"
    )
ON CONFLICT ("id") DO NOTHING;

-- AddForeignKey
ALTER TABLE "posts"
ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;