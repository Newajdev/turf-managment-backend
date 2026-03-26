-- DropIndex
DROP INDEX "idx_review_playerId";

-- DropIndex
DROP INDEX "idx_sysadmin_email";

-- DropIndex
DROP INDEX "idx_turfowner_email";

-- CreateIndex
CREATE INDEX "idx_review_playerId" ON "review"("playerId");

-- CreateIndex
CREATE INDEX "idx_sysadmin_email" ON "system_admin"("email");

-- CreateIndex
CREATE INDEX "idx_turfowner_email" ON "turf_owner"("email");
