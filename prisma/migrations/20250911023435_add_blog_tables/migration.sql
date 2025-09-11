/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Post";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" BIGSERIAL NOT NULL,
    "avatar" TEXT,
    "createTime" TIMESTAMP(3),
    "email" TEXT,
    "nickname" TEXT,
    "password" TEXT,
    "type" INTEGER,
    "updateTime" TIMESTAMP(3),
    "username" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Type" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Blog" (
    "id" BIGSERIAL NOT NULL,
    "appreciation" BOOLEAN NOT NULL,
    "commentabled" BOOLEAN NOT NULL,
    "content" TEXT,
    "createTime" TIMESTAMP(3),
    "description" TEXT,
    "firstPicture" TEXT,
    "flag" TEXT,
    "published" BOOLEAN NOT NULL,
    "recommend" BOOLEAN NOT NULL,
    "shareStatement" BOOLEAN NOT NULL,
    "title" TEXT,
    "updateTime" TIMESTAMP(3),
    "views" INTEGER,
    "typeId" BIGINT,
    "userId" BIGINT,
    "commentCount" INTEGER,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" BIGSERIAL NOT NULL,
    "nickname" TEXT,
    "email" TEXT,
    "content" TEXT,
    "avatar" TEXT,
    "createTime" TIMESTAMP(3),
    "blogId" BIGINT,
    "parentCommentId" BIGINT,
    "adminComment" BOOLEAN NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" BIGSERIAL NOT NULL,
    "nickname" TEXT,
    "email" TEXT,
    "content" TEXT,
    "avatar" TEXT,
    "createTime" TIMESTAMP(3),
    "parentMessageId" BIGINT,
    "adminMessage" BOOLEAN NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Picture" (
    "id" BIGSERIAL NOT NULL,
    "pictureAddress" TEXT,
    "pictureDescription" TEXT,
    "pictureName" TEXT,
    "pictureTime" TEXT,

    CONSTRAINT "Picture_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Blog" ADD CONSTRAINT "Blog_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."Type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Blog" ADD CONSTRAINT "Blog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "public"."Blog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "public"."Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "public"."Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
