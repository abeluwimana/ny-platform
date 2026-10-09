CREATE TABLE "CoupleGalleryImage" (
    "id" SERIAL NOT NULL,
    "coupleId" INTEGER NOT NULL,
    "imageData" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoupleGalleryImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CoupleGalleryImage_coupleId_createdAt_idx" ON "CoupleGalleryImage"("coupleId", "createdAt");

ALTER TABLE "CoupleGalleryImage"
ADD CONSTRAINT "CoupleGalleryImage_coupleId_fkey"
FOREIGN KEY ("coupleId") REFERENCES "CoupleProfile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
