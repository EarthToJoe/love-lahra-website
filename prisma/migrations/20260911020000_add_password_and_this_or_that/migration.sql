-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "this_or_that" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "optionAImage" TEXT NOT NULL,
    "optionALabel" TEXT NOT NULL,
    "optionAVotes" INTEGER NOT NULL DEFAULT 0,
    "optionBImage" TEXT NOT NULL,
    "optionBLabel" TEXT NOT NULL,
    "optionBVotes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "this_or_that_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "this_or_that_votes" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "choice" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "this_or_that_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "this_or_that_votes_questionId_visitorId_key" ON "this_or_that_votes"("questionId", "visitorId");

-- AddForeignKey
ALTER TABLE "this_or_that_votes" ADD CONSTRAINT "this_or_that_votes_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "this_or_that"("id") ON DELETE CASCADE ON UPDATE CASCADE;

