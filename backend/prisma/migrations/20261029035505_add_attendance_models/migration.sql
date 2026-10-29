-- CreateTable
CREATE TABLE "attendance_sessions" (
    "id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "session_number" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TEXT,
    "end_time" TEXT,
    "topic" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "attendance_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Hadir',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_sessions_class_id_idx" ON "attendance_sessions"("class_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_sessions_class_id_session_number_key" ON "attendance_sessions"("class_id", "session_number");

-- CreateIndex
CREATE INDEX "attendance_records_student_id_idx" ON "attendance_records"("student_id");

-- CreateIndex
CREATE INDEX "attendance_records_session_id_idx" ON "attendance_records"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_session_id_student_id_key" ON "attendance_records"("session_id", "student_id");

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "attendance_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
