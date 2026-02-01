-- ============================================================
-- Fireside Capital — Data Seed
-- 
-- INSTRUCTIONS:
-- 1. First run migration.sql to create all tables
-- 2. Sign up in the app to create your auth user
-- 3. Find your new user UUID in Supabase Dashboard → Authentication → Users
-- 4. Find & Replace all instances of 8b6aca68-6072-457d-8053-7e81e41bfef3 below with your actual UUID
-- 5. Run this script in the SQL Editor
-- ============================================================

-- ========================
-- ASSETS (2 records)
-- ========================
INSERT INTO public.assets (id, user_id, created_at, name, type, value, loan, "interestRate", "loanStartDate", "nextDueDate", "purchaseDate", "purchasePrice", "termYears")
VALUES
  ('e27f137f-153c-4eb9-af30-7c46533c9102', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:08.733972Z', 'BMW X5', 'vehicle', 85000, 44320, 9.6, '2020-03-27', '2025-07-14', NULL, NULL, NULL),
  ('5a93ed58-b768-4d60-883c-a61a22fb5a69', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:08.733972Z', '2700 Bingham Drive', 'realEstate', 288100, 246544.53, 6.5, NULL, '2025-07-01', '2025-04-30', 270000, 30);

-- ========================
-- BILLS (8 records)
-- ========================
INSERT INTO public.bills (id, user_id, created_at, name, type, amount, frequency, "nextDueDate")
VALUES
  ('720b3101-5e22-47d6-8f6c-46830fbe6ded', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:08.96572Z', 'People''s Gas', 'Utility', 85.86, 'Monthly', '2025-07-07'),
  ('62ffbad6-ffb7-4ec5-821b-6d03ee712637', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:08.96572Z', 'American Water', 'Utility', 107.03, 'Monthly', '2025-07-04'),
  ('045ff7c2-ba33-4853-95f7-4f3bb1e6a377', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:08.96572Z', 'West Penn Power', 'Utility', 106.36, 'Monthly', '2025-07-07'),
  ('f4abace2-ea11-42e8-bf58-7d1f1ca9083d', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:08.96572Z', 'Verizon Wireless', 'Other', 197.77, 'Monthly', '2025-06-21'),
  ('c9761fe6-ab6a-4b59-852d-dbc8549549c9', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:08.96572Z', 'BMW Lease', 'Other', 1053.69, 'Monthly', '2025-07-04'),
  ('8e5210d0-2845-4958-99bd-98947c298d35', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:08.96572Z', 'Turbo Tax', 'Other', 322, 'Monthly', '2025-06-20'),
  ('47fbb866-2751-4a5e-b113-2bc531de5fc6', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-30T17:09:09.03302Z', 'HOA Fees', 'Other', 170, 'Monthly', '2025-07-01'),
  ('b21448d7-58d7-4f6d-8a2b-dfe066f40f01', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:08.96572Z', 'Sewage', 'Utility', 162.25, 'Monthly', '2025-07-01');

-- ========================
-- DEBTS (3 records)
-- ========================
INSERT INTO public.debts (id, user_id, created_at, name, type, amount, "interestRate", term, "monthlyPayment", "nextDueDate")
VALUES
  ('e4e6dd47-9c7d-4646-bf30-28aef0e92af6', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:08.890658Z', 'Capital One', 'Credit Card', 957.69, 28.98, 1, 200, '2025-06-16'),
  ('fae53b26-9789-41fc-8266-276162def8ae', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:08.890658Z', 'Chase Sapphire Reserve', 'Credit Card', 0, 13, 1, 0, '2025-07-18'),
  ('b7e1f37c-4532-4017-b5b6-833d29ca5732', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:08.890658Z', 'Robinhood Credit Card', 'Credit Card', 8842.04, 13, 1, 500, '2025-07-01');

-- ========================
-- INCOME (2 records)
-- ========================
INSERT INTO public.income (id, user_id, created_at, name, type, amount, frequency, "nextDueDate")
VALUES
  ('d973de4a-0dc1-4616-9b9c-4c5feab6bda3', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:09.043705Z', 'Huntington Ingalls', 'W2', 3569, 'Bi-Weekly', '2025-06-20'),
  ('7d5c35b3-1706-40cf-9585-16334eba45a3', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:09.043705Z', 'FERC', '1099', 5700, 'Monthly', '2025-08-08');

-- ========================
-- INVESTMENTS (5 records)
-- ========================
INSERT INTO public.investments (id, user_id, created_at, name, type, value, "startingBalance", "monthlyContribution", "annualReturn", "nextContributionDate")
VALUES
  ('a7fd20fa-263b-4ec0-b517-447fa2cbbb27', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:08.823225Z', 'Brittany 401k', '401(k)', 108592, 102645.05, 300, 8, '2025-06-27'),
  ('d8a778a8-d216-44ec-85db-41515043b496', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:08.823225Z', 'Matt 401k', '401(k)', 80434.15, 74370, 12, 8, '2025-07-18'),
  ('bcf53d9b-9cb0-4754-96e5-96247e8614a5', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:08.823225Z', 'Emergency Fund', 'Other', 10000, 7000, 200, 1.5, '2025-07-25'),
  ('34150730-c2fb-46c3-b4e4-aab31ec2dcc9', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:08.823225Z', 'Robinhood', 'Crypto', 8775.97, 5940, 1000, 15, '2025-07-11'),
  ('c5a29c93-6d2e-4718-8b79-69ef20b648bc', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25T20:00:08.823225Z', 'GME', 'Stock', 6719.15, 6419.78, 0, 15, NULL);

-- ========================
-- SETTINGS (1 record)
-- ========================
INSERT INTO public.settings (user_id, emergency_fund_goal, created_at)
VALUES
  ('8b6aca68-6072-457d-8053-7e81e41bfef3', 30000, '2025-06-27T15:58:02.85126Z');

-- ========================
-- SNAPSHOTS (15 records — net worth history)
-- ========================
INSERT INTO public.snapshots (user_id, date, "netWorth", created_at)
VALUES
  ('8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-16', 247278, '2025-06-25T20:00:09.116541Z'),
  ('8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-18', 252388.26, '2025-06-25T20:00:09.116541Z'),
  ('8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-19', 255423.26, '2025-06-25T20:00:09.116541Z'),
  ('8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-20', 265023.26, '2025-06-25T20:00:09.116541Z'),
  ('8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-21', 264925.26, '2025-06-25T20:00:09.116541Z'),
  ('8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-23', 263913.20, '2025-06-25T20:00:09.116541Z'),
  ('8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-24', 264230.22, '2025-06-25T20:00:09.116541Z'),
  ('8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-25', 266465.93, '2025-06-25T20:00:09.116541Z'),
  ('8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06-27', 272245.95, '2025-06-27T12:22:58.326606Z'),
  ('8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-07-03', 278234.52, '2025-07-03T10:35:10.040834Z'),
  ('8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-07-07', 280026.26, '2025-07-07T01:44:41.657869Z'),
  ('8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-07-11', 282379.23, '2025-07-11T00:42:29.038892Z'),
  ('8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-07-14', 282718.30, '2025-07-14T02:46:03.206349Z'),
  ('8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-07-21', 284725.31, '2025-07-21T10:34:49.423885Z');

-- ========================
-- BUDGETS (8 records)
-- ========================
INSERT INTO public.budgets (id, user_id, month, item_id, item_type, assigned_amount, name, category, needed_amount)
VALUES
  ('03080511-bcfe-4b86-af1e-07f6cb90b239', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06', 'b21448d7-58d7-4f6d-8a2b-dfe066f40f01', 'bill', 13.69, NULL, NULL, 0),
  ('37d5d738-94e2-43c6-86a0-0dc41b7c9579', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06', '720b3101-5e22-47d6-8f6c-46830fbe6ded', 'bill', 85.86, NULL, NULL, 0),
  ('90fd203e-2f50-4f2f-9f21-7a31fcb67515', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06', '62ffbad6-ffb7-4ec5-821b-6d03ee712637', 'bill', 107.03, NULL, NULL, 0),
  ('819e81b4-6a25-41a3-bf71-6a17ff65f4a6', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06', '045ff7c2-ba33-4853-95f7-4f3bb1e6a377', 'bill', 150, NULL, NULL, 0),
  ('07b73e78-274e-4093-97f8-bbbc024dbe7e', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06', 'f4abace2-ea11-42e8-bf58-7d1f1ca9083d', 'bill', 197.77, NULL, NULL, 0),
  ('be8f69f6-f473-4bc5-97a1-71f06b65cbd8', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-06', 'c9761fe6-ab6a-4b59-852d-dbc8549549c9', 'bill', 500, NULL, NULL, 0),
  ('b135909f-0849-46c0-9a2a-445212016980', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-07', '720b3101-5e22-47d6-8f6c-46830fbe6ded', 'bill', 85.86, NULL, NULL, 0),
  ('c1607122-64f4-41df-8fd6-92fe88909b6b', '8b6aca68-6072-457d-8053-7e81e41bfef3', '2025-07', '62ffbad6-ffb7-4ec5-821b-6d03ee712637', 'bill', 50, NULL, NULL, 0);

