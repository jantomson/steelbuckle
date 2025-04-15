-- CreateTable
CREATE TABLE "contact_info" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "office_city" VARCHAR(100) NOT NULL,
    "office_postal" VARCHAR(20) NOT NULL,
    "office_street" VARCHAR(255) NOT NULL,
    "office_room" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_numbers" (
    "id" SERIAL NOT NULL,
    "contact_info_id" INTEGER NOT NULL,
    "number" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phone_numbers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "phone_numbers" ADD CONSTRAINT "phone_numbers_contact_info_id_fkey" FOREIGN KEY ("contact_info_id") REFERENCES "contact_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;
