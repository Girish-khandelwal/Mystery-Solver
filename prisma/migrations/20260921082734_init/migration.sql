-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PlayerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetectiveRank" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "minimumXp" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "contentStatus" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CaseProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "updatedAt" DATETIME NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseProgress_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidenceDiscovery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "progressId" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "analyzed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "EvidenceDiscovery_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "CaseProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LocationProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "progressId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    CONSTRAINT "LocationProgress_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "CaseProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterrogationProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "progressId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    CONSTRAINT "InterrogationProgress_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "CaseProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeductionProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "progressId" TEXT NOT NULL,
    "deductionId" TEXT NOT NULL,
    CONSTRAINT "DeductionProgress_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "CaseProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "progressId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "PlayerNote_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "CaseProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PlayerAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "progressId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "accuracy" INTEGER NOT NULL,
    "report" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseResult_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "CaseProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "muted" BOOLEAN NOT NULL DEFAULT true,
    "soundVolume" INTEGER NOT NULL DEFAULT 50,
    "musicVolume" INTEGER NOT NULL DEFAULT 25,
    "textSize" TEXT NOT NULL DEFAULT 'normal',
    "reducedMotion" BOOLEAN NOT NULL DEFAULT false,
    "tutorialDone" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_sessionToken_key" ON "User"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_userId_key" ON "PlayerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DetectiveRank_minimumXp_key" ON "DetectiveRank"("minimumXp");

-- CreateIndex
CREATE UNIQUE INDEX "Case_caseNumber_key" ON "Case"("caseNumber");

-- CreateIndex
CREATE INDEX "CaseProgress_userId_updatedAt_idx" ON "CaseProgress"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CaseProgress_userId_caseId_key" ON "CaseProgress"("userId", "caseId");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceDiscovery_progressId_evidenceId_key" ON "EvidenceDiscovery"("progressId", "evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "LocationProgress_progressId_locationId_key" ON "LocationProgress"("progressId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "InterrogationProgress_progressId_questionId_key" ON "InterrogationProgress"("progressId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "DeductionProgress_progressId_deductionId_key" ON "DeductionProgress"("progressId", "deductionId");

-- CreateIndex
CREATE INDEX "PlayerNote_progressId_idx" ON "PlayerNote"("progressId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerAchievement_userId_achievementId_key" ON "PlayerAchievement"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseResult_progressId_key" ON "CaseResult"("progressId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");
