/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `sport_type` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[icon]` on the table `sport_type` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "sport_type_title_key" ON "sport_type"("title");

-- CreateIndex
CREATE UNIQUE INDEX "sport_type_icon_key" ON "sport_type"("icon");
