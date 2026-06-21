-- Add CHECK constraint to prevent negative balance
-- This is the last line of defense against race conditions
ALTER TABLE "EmployeeLeaveBalance" 
ADD CONSTRAINT check_balance_non_negative CHECK (balance >= 0);
