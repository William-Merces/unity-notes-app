-- update_schema.sql
BEGIN;

CREATE TABLE "Class" (
   "id" TEXT NOT NULL,
   "name" TEXT NOT NULL,
   "wardId" TEXT,
   "organization" TEXT,
   "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   "updatedAt" TIMESTAMP(3) NOT NULL,
   CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Enrollment" (
   "id" TEXT NOT NULL,
   "userId" TEXT NOT NULL,
   "classId" TEXT NOT NULL,
   "status" TEXT NOT NULL DEFAULT 'ACTIVE',
   "isGuest" BOOLEAN NOT NULL DEFAULT false,
   "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   "updatedAt" TIMESTAMP(3) NOT NULL,
   CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "User" ALTER COLUMN "wardId" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "organization" DROP NOT NULL;

ALTER TABLE "Lesson" ADD COLUMN "classId" TEXT;
ALTER TABLE "Lesson" ALTER COLUMN "wardId" DROP NOT NULL;

ALTER TABLE "Attendance" ADD COLUMN "isGuest" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Class_wardId_idx" ON "Class"("wardId");
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment"("userId");
CREATE INDEX "Enrollment_classId_idx" ON "Enrollment"("classId");
CREATE UNIQUE INDEX "Enrollment_userId_classId_key" ON "Enrollment"("userId", "classId");
CREATE INDEX "Lesson_classId_idx" ON "Lesson"("classId");

ALTER TABLE "Class" ADD CONSTRAINT "Class_wardId_fkey" 
   FOREIGN KEY ("wardId") REFERENCES "Ward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey"
   FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_classId_fkey"
   FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_classId_fkey"
   FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;