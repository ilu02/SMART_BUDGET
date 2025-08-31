-- AlterTable
ALTER TABLE "public"."transactions" ADD COLUMN     "budgetId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "public"."budgets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
