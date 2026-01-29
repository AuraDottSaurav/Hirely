-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT,
    "keywords" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "assignmentDetails" TEXT
);

-- CreateTable
CREATE TABLE "FormConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "includeName" BOOLEAN NOT NULL DEFAULT true,
    "includeEmail" BOOLEAN NOT NULL DEFAULT true,
    "includeResume" BOOLEAN NOT NULL DEFAULT false,
    "includePortfolio" BOOLEAN NOT NULL DEFAULT false,
    "includeNoticePeriod" BOOLEAN NOT NULL DEFAULT false,
    "includeCurrentOrg" BOOLEAN NOT NULL DEFAULT false,
    "includeYearsExperience" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "FormConfig_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "resumeUrl" TEXT,
    "portfolioUrl" TEXT,
    "noticePeriod" TEXT,
    "currentOrg" TEXT,
    "yearsOfExperience" TEXT,
    "screeningScore" INTEGER,
    "screeningReason" TEXT,
    "assignmentSubmission" TEXT,
    "aiSummary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interviewStatus" TEXT,
    "interviewDate" DATETIME,
    "meetingLink" TEXT,
    "proposedSlots" TEXT,
    CONSTRAINT "Candidate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "googleAccessToken" TEXT,
    "googleRefreshToken" TEXT,
    "googleTokenExpiry" BIGINT,
    "updatedAt" DATETIME NOT NULL,
    "geminiApiKey" TEXT,
    "googleClientId" TEXT,
    "googleClientSecret" TEXT,
    "googleRedirectUri" TEXT,
    "clerkPublishableKey" TEXT,
    "clerkSecretKey" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "FormConfig_jobId_key" ON "FormConfig"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
