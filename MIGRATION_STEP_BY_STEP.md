# 🎯 Database Migration - Step-by-Step Visual Guide

## 📋 What You'll Need

- ✅ Access to your Supabase project
- ✅ The file: `supabase/inventory-management.sql`
- ✅ 5 minutes of your time

---

## 🚀 Step-by-Step Instructions

### Step 1: Open the Migration File

**On your computer:**

1. Navigate to your project folder: `C:\coding\reward-system\`
2. Open the folder: `supabase\`
3. Find the file: `inventory-management.sql`
4. Right-click → Open with → Notepad (or any text editor)

**What you'll see:**
```sql
-- Add inventory management fields to rewards table
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;
...
(lots more SQL code)
```

5. Select ALL the text (Ctrl + A)
6. Copy it (Ctrl + C)

---

### Step 2: Open Supabase Dashboard

1. Open your web browser
2. Go to: https://app.supabase.com
3. Log in to your account
4. Select your project (the one for this reward system)

**You should see:**
```
┌─────────────────────────────────────────────────┐
│  Supabase Dashboard                             │
├─────────────────────────────────────────────────┤
│  [Home]  [Table Editor]  [SQL Editor]  [...]   │
│                                                 │
│  Your Project Name                              │
└─────────────────────────────────────────────────┘
```

---

### Step 3: Go to SQL Editor

1. Look at the **left sidebar**
2. Find the icon that looks like `</>` or says "SQL Editor"
3. Click on it

**Visual Guide:**
```
Sidebar Menu:
┌──────────────────┐
│ 🏠 Home         │
│ 📊 Table Editor │
│ </> SQL Editor  │ ← Click Here!
│ 🔧 Database     │
│ 📝 API Docs     │
│ ⚙️ Settings     │
└──────────────────┘
```

---

### Step 4: Create New Query

1. In the SQL Editor, look for a button that says **"+ New query"** or **"New Query"**
2. Click it

**What you'll see:**
```
┌─────────────────────────────────────────────────┐
│  SQL Editor                     [+ New query]   │
├─────────────────────────────────────────────────┤
│                                                 │
│  -- Write your SQL here                         │
│  (empty text area)                              │
│                                                 │
│                                                 │
│                                   [Run] button  │
└─────────────────────────────────────────────────┘
```

---

### Step 5: Paste the Migration SQL

1. Click in the empty text area
2. Paste the SQL you copied earlier (Ctrl + V)

**What you'll see now:**
```
┌─────────────────────────────────────────────────┐
│  SQL Editor                     [+ New query]   │
├─────────────────────────────────────────────────┤
│  -- Add inventory management fields...          │
│  ALTER TABLE rewards ADD COLUMN...              │
│  CREATE TABLE IF NOT EXISTS restock_history...  │
│  CREATE INDEX IF NOT EXISTS...                  │
│  CREATE OR REPLACE VIEW...                      │
│  CREATE OR REPLACE FUNCTION...                  │
│  (lots of SQL code)                             │
│                                                 │
│                               [Run] button      │
└─────────────────────────────────────────────────┘
```

---

### Step 6: Run the Migration

1. Look for the **"Run"** button (usually green, bottom-right)
2. Click it
3. Wait (should take 1-3 seconds)

**Loading:**
```
┌─────────────────────────────────────────────────┐
│  Running query...  ⏳                           │
└─────────────────────────────────────────────────┘
```

---

### Step 7: Check the Result

**✅ SUCCESS looks like:**
```
┌─────────────────────────────────────────────────┐
│  ✅ Success. No rows returned                   │
│  Query executed in 1.2s                         │
└─────────────────────────────────────────────────┘
```

**❌ ERROR looks like:**
```
┌─────────────────────────────────────────────────┐
│  ❌ Error: relation "rewards" does not exist    │
└─────────────────────────────────────────────────┘
```

If you see **SUCCESS** → Great! Continue to Step 8
If you see **ERROR** → Check the Troubleshooting section below

---

### Step 8: Verify the Changes

#### Verify Part 1: Check New Columns

1. Still in Supabase Dashboard
2. Click **"Table Editor"** in the left sidebar
3. Click on the **"rewards"** table
4. Look at the column headers

**What you should see:**
```
rewards table columns:
┌────┬──────┬────────┬──────────┬──────────┬────────────┬──────┬────────────┬────────────┬───────────┬──────────────────────┬────────────────────┐
│ id │ name │ points │ category │ quantity │ variant... │ tier │ created... │ updated... │ is_active │ low_stock_threshold  │ last_restocked_at  │
│    │      │        │          │          │            │      │            │            │    NEW!   │         NEW!         │        NEW!        │
└────┴──────┴────────┴──────────┴──────────┴────────────┴──────┴────────────┴────────────┴───────────┴──────────────────────┴────────────────────┘
```

The last 3 columns are NEW! ✅

---

#### Verify Part 2: Check New Table

1. In **"Table Editor"**
2. Look at the list of tables on the left
3. Find **"restock_history"** (should be new!)

**What you should see:**
```
Tables:
┌─────────────────────┐
│ ▸ claims           │
│ ▸ reward_galleries │
│ ▸ reward_variants  │
│ ▸ rewards          │
│ ▸ restock_history  │ ← NEW! This is new!
└─────────────────────┘
```

4. Click on **"restock_history"**
5. You should see an empty table with these columns:

```
restock_history columns:
┌────┬───────────┬───────────────────┬────────────────┬──────────────┬──────────────┬───────┬────────────┐
│ id │ reward_id │ previous_quantity │ added_quantity │ new_quantity │ restocked_by │ notes │ created_at │
└────┴───────────┴───────────────────┴────────────────┴──────────────┴──────────────┴───────┴────────────┘
(no rows yet - that's normal!)
```

---

#### Verify Part 3: Test a Trigger

1. Go back to **"SQL Editor"**
2. Create a new query
3. Copy and paste this test code:

```sql
-- Find a reward to test with
SELECT id, name, quantity, is_active FROM rewards LIMIT 1;
```

4. Click **"Run"**
5. You'll see one reward. **Copy its ID** (the UUID)

6. Now run this (replace `YOUR-REWARD-ID` with the ID you just copied):

```sql
-- Set quantity to 0 to trigger auto-disable
UPDATE rewards 
SET quantity = 0 
WHERE id = 'YOUR-REWARD-ID';

-- Check if is_active became false
SELECT id, name, quantity, is_active 
FROM rewards 
WHERE id = 'YOUR-REWARD-ID';
```

**Expected Result:**
```
┌──────────────────────────────┬─────────────┬──────────┬───────────┐
│ id                           │ name        │ quantity │ is_active │
├──────────────────────────────┼─────────────┼──────────┼───────────┤
│ abc123...                    │ Gaming Mouse│    0     │   false   │ ← Should be false!
└──────────────────────────────┴─────────────┴──────────┴───────────┘
```

If `is_active` = `false` → **Trigger is working!** ✅

7. **Important:** Set the quantity back:

```sql
-- Restore the quantity
UPDATE rewards 
SET quantity = 10 
WHERE id = 'YOUR-REWARD-ID';
```

---

## 🎉 Success!

If all verifications passed, your migration is complete! You now have:

- ✅ 3 new columns in rewards table
- ✅ New restock_history table
- ✅ Working triggers that auto-disable items
- ✅ Database views for alerts

**You can now use the Inventory Management feature in the admin panel!**

---

## ⚠️ Troubleshooting

### Problem 1: "relation 'rewards' does not exist"

**What it means:** The main database schema isn't set up yet

**Solution:**
1. First run the base schema: `supabase/schema.sql`
2. Then run: `supabase/inventory-management.sql`

**How to run schema.sql:**
- Same process as above
- Just use `schema.sql` instead
- Run it first, then come back and run `inventory-management.sql`

---

### Problem 2: "column 'is_active' already exists"

**What it means:** Migration was already run before

**Solution:** This is actually fine! The migration is idempotent (safe to run multiple times).
- Just ignore the message
- Or delete the specific ALTER TABLE lines that are causing issues
- The rest will still run

---

### Problem 3: "permission denied"

**What it means:** You don't have admin access to the database

**Solution:**
1. Make sure you're logged in to the correct Supabase project
2. Check that you're the owner/admin of the project
3. Try refreshing the page and logging in again

---

### Problem 4: SQL Editor won't run

**What it means:** Browser or connection issue

**Solution:**
1. Refresh the page (F5)
2. Try a different browser
3. Check your internet connection
4. Clear browser cache

---

### Problem 5: Can't find the file

**What it means:** Looking in wrong folder

**Solution:**
File is at: `C:\coding\reward-system\supabase\inventory-management.sql`

**Quick way to open:**
1. Press `Windows + R`
2. Type: `notepad C:\coding\reward-system\supabase\inventory-management.sql`
3. Press Enter

---

## 📊 What Actually Happened?

When you clicked "Run", the database executed these commands in order:

```
1. ALTER TABLE rewards...
   → Added is_active column
   → Added low_stock_threshold column  
   → Added last_restocked_at column

2. CREATE TABLE restock_history...
   → Created new table for tracking

3. CREATE INDEX...
   → Made queries faster

4. CREATE VIEW low_stock_rewards...
   → Created shortcut for low stock query

5. CREATE VIEW out_of_stock_rewards...
   → Created shortcut for out of stock query

6. CREATE FUNCTION auto_deactivate...
   → Created automatic code

7. CREATE TRIGGER...
   → Attached automatic code to rewards table

8. CREATE FUNCTION log_restock...
   → Created automatic logging code

9. CREATE TRIGGER...
   → Attached logging to rewards table
```

Now your database is upgraded! 🎊

---

## 🎓 Quick Quiz (Test Your Understanding)

**Q1:** What does "ALTER TABLE" do?
**A:** Modifies an existing table (adds/removes columns)

**Q2:** What does "IF NOT EXISTS" do?
**A:** Makes it safe to run the command multiple times (won't error if already exists)

**Q3:** What is a database trigger?
**A:** Code that runs automatically when something happens (like updating a row)

**Q4:** What does our trigger do?
**A:** Auto-disables rewards when quantity = 0, and re-enables when restocked

**Q5:** What is a database view?
**A:** A saved query that you can call by name (like a shortcut)

---

## 🔄 Need to Undo the Migration?

If you need to remove the changes (not recommended unless testing):

```sql
-- WARNING: This will delete data!
DROP TRIGGER IF EXISTS trigger_log_restock_history ON rewards;
DROP TRIGGER IF EXISTS trigger_auto_deactivate_out_of_stock ON rewards;
DROP FUNCTION IF EXISTS log_restock_history();
DROP FUNCTION IF EXISTS auto_deactivate_out_of_stock();
DROP VIEW IF EXISTS out_of_stock_rewards;
DROP VIEW IF EXISTS low_stock_rewards;
DROP TABLE IF EXISTS restock_history;
ALTER TABLE rewards DROP COLUMN IF EXISTS last_restocked_at;
ALTER TABLE rewards DROP COLUMN IF EXISTS low_stock_threshold;
ALTER TABLE rewards DROP COLUMN IF EXISTS is_active;
```

**Only use this if you need to start over!**

---

## 📞 Still Need Help?

If you're stuck:

1. **Check the error message** - It usually tells you what's wrong
2. **Read DATABASE_MIGRATION_TUTORIAL.md** - More detailed explanations
3. **Check Supabase logs** - Look for error details
4. **Take a screenshot** - Share the error message if asking for help

---

## ✅ Final Checklist

Before moving on, make sure:

- [ ] You ran the SQL in Supabase SQL Editor
- [ ] You saw "Success" message (no red errors)
- [ ] rewards table has 3 new columns
- [ ] restock_history table exists
- [ ] You tested the trigger (quantity = 0 sets is_active = false)
- [ ] You restored any test data you changed

**All checked?** → **Congratulations! Migration complete!** 🎉

**Next step:** Open the admin panel and try the new Inventory Management feature!

→ http://localhost:3000/admin
→ Click "📦 Manage Inventory"
