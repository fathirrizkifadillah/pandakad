-- CreateTable
CREATE TABLE "grades" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "attendance_score" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "assignment_score" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "midterm_score" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "final_exam_score" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "final_score" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "letter_grade" TEXT NOT NULL DEFAULT 'E',
    "grade_point" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "submitted_at" TIMESTAMPTZ,
    "submitted_by_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_audit_logs" (
    "id" TEXT NOT NULL,
    "grade_id" TEXT NOT NULL,
    "changed_by_id" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "previous_score" DECIMAL(5,2),
    "new_score" DECIMAL(5,2) NOT NULL,
    "previous_grade" TEXT,
    "new_grade" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'Pembaruan nilai',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grade_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grades_enrollment_id_key" ON "grades"("enrollment_id");

-- CreateIndex
CREATE INDEX "grade_audit_logs_grade_id_idx" ON "grade_audit_logs"("grade_id");

-- CreateIndex
CREATE INDEX "grade_audit_logs_changed_by_id_idx" ON "grade_audit_logs"("changed_by_id");

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_audit_logs" ADD CONSTRAINT "grade_audit_logs_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_audit_logs" ADD CONSTRAINT "grade_audit_logs_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
