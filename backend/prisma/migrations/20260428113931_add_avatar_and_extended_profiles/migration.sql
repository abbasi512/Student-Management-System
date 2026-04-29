-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "nationality" TEXT;

-- AlterTable
ALTER TABLE "TeacherProfile" ADD COLUMN     "officeHours" TEXT,
ADD COLUMN     "qualification" TEXT,
ADD COLUMN     "specialization" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT;
