# 📚 Database Migration Tutorial

## What is a Database Migration?

### Simple Explanation
A **database migration** is like updating the blueprint of your database. Just like renovating a house:
- **Before Migration**: Your house has 3 bedrooms
- **After Migration**: Your house has 4 bedrooms (you added one)

In our case:
- **Before Migration**: Your database has a `rewards` table with basic columns
- **After Migration**: Your database has:
  - New columns in `rewards` table
  - New `restock_history` table
  - Automatic triggers
  - Database views

### Why Do We Need It?
- **Add new features** without breaking existing data
- **Evolve the database** as the application grows
- **Track changes** to database structure over time
- **Apply same changes** across development, staging, and production

---

## 🎯 What Our Migration Does

### Before Migration
```
rewards table:
- id
- name
- points
- category
- quantity
- variant_type
- tier
- created_at
- updated_at
```

### After Migration
```
rewards table (ENHANCED):
- id
- name
- points
- category
- quantity
- variant_type
- tier
- created_at
- updated_at
- is_active              ← NEW! (auto-disable feature)
- low_stock_threshold    ← NEW! (alert threshold)
- last_restocked_at      ← NEW! (tracking)

restock_history table (NEW):
- id
- reward_id
- previous_quantity
- added_quantity
- new_quantity
- restocked_by
- notes
- created_at

PLUS:
- 2 Database Views (queries saved for reuse)
- 2 Automatic Triggers (code that runs automatically)
```

---

## 🔍 Understanding the Migration File

Let's break down `supabase/inventory-management.sql`:

### Section 1: Add Columns to Existing Table
```sql
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
```

**What it means:**
- `ALTER TABLE rewards` = Modify the rewards table
- `ADD COLUMN` = Add a new column
- `IF NOT EXISTS` = Only add if it doesn't exist (safe to run multiple times)
- `is_active BOOLEAN` = Column name and type (true/false)
- `DEFAULT true` = New column starts as true for all rows

**Why we need it:**
- Auto-disable rewards when out of stock
- Prevent users from claiming unavailable items

---

### Section 2: Create New Table
```sql
CREATE TABLE IF NOT EXISTS restock_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  previous_quantity INTEGER NOT NULL,
  added_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  restocked_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**What it means:**
- `CREATE TABLE` = Make a new table
- `IF NOT EXISTS` = Only create if doesn't exist
- `id UUID PRIMARY KEY` = Unique identifier for each row
- `reward_id UUID ... REFERENCES rewards(id)` = Links to rewards table
- `ON DELETE CASCADE` = If reward deleted, delete history too
- `NOT NULL` = This field is required
- `DEFAULT NOW()` = Automatically set to current time

**Why we need it:**
- Track every restock operation
- Complete audit trail
- Know who restocked, when, and how much

---

### Section 3: Create Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_restock_history_reward_id 
ON restock_history(reward_id);
```

**What it means:**
- `CREATE INDEX` = Speed up database queries
- Like creating an index in a book to find pages faster

**Why we need it:**
- Makes queries much faster
- Especially important when table grows large

---

### Section 4: Database Views
```sql
CREATE OR REPLACE VIEW low_stock_rewards AS
SELECT 
  r.id,
  r.name,
  r.category,
  r.quantity,
  r.low_stock_threshold
FROM rewards r
WHERE r.quantity <= r.low_stock_threshold
  AND r.is_active = true
ORDER BY r.quantity ASC;
```

**What it means:**
- `CREATE VIEW` = Save a complex query with a name
- Like creating a bookmark to a specific filtered view of your data
- `WHERE r.quantity <= r.low_stock_threshold` = Only show items below threshold

**Why we need it:**
- Easily get all low-stock items with one query
- Reusable across the application
- Keeps code clean

---

### Section 5: Automatic Triggers
```sql
CREATE OR REPLACE FUNCTION auto_deactivate_out_of_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity = 0 AND NEW.is_active = true THEN
    NEW.is_active = false;
  ELSIF NEW.quantity > 0 AND OLD.quantity = 0 THEN
    NEW.is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_deactivate_out_of_stock
  BEFORE UPDATE ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION auto_deactivate_out_of_stock();
```

**What it means:**
- `CREATE FUNCTION` = Create reusable code that runs in database
- `RETURNS TRIGGER` = This code runs automatically when something happens
- `BEFORE UPDATE ON rewards` = Runs before any reward is updated
- `FOR EACH ROW` = Runs for every row being updated
- `NEW.quantity` = The new value being set
- `OLD.quantity` = The previous value

**Logic explanation:**
```
IF quantity becomes 0 AND item is active:
    → Set is_active to false (disable it)

IF quantity becomes > 0 AND item was at 0:
    → Set is_active to true (re-enable it)
```

**Why we need it:**
- Automatic protection - no manual work needed
- Prevents users from claiming out-of-stock items
- Automatically reactivates when restocked

---

## 🚀 How to Run the Migration

### Method 1: Using Supabase Dashboard (Recommended for Beginners)

**Step 1: Open Supabase**
1. Go to your Supabase project dashboard
2. URL looks like: `https://app.supabase.com/project/your-project-id`

**Step 2: Navigate to SQL Editor**
1. Look for the left sidebar menu
2. Click on "SQL Editor" icon (looks like `</>`)

**Step 3: Create New Query**
1. Click the "+ New query" button
2. You'll see an empty text editor

**Step 4: Copy the Migration SQL**
1. Open the file: `supabase/inventory-management.sql`
2. Select all content (Ctrl+A or Cmd+A)
3. Copy (Ctrl+C or Cmd+C)

**Step 5: Paste and Run**
1. Paste into the Supabase SQL Editor (Ctrl+V or Cmd+V)
2. Click the "Run" button (usually green, bottom-right)
3. Wait for execution (should take 1-2 seconds)

**Step 6: Verify Success**
You should see:
- ✅ Green checkmarks
- Message: "Success. No rows returned"
- No error messages in red

**Step 7: Verify Changes**
1. Go to "Table Editor" in left sidebar
2. Click on "rewards" table
3. You should see new columns: `is_active`, `low_stock_threshold`, `last_restocked_at`
4. Look for new table: `restock_history`

---

### Method 2: Using psql Command Line (Advanced)

**If you have psql installed:**

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration file
\i supabase/inventory-management.sql

# Exit
\q
```

---

## 🧪 Testing the Migration

### Test 1: Check New Columns
```sql
-- Run this in SQL Editor
SELECT 
  id, 
  name, 
  quantity, 
  is_active, 
  low_stock_threshold 
FROM rewards 
LIMIT 5;
```

**Expected result:** Should show all columns without errors

---

### Test 2: Check New Table
```sql
-- Run this in SQL Editor
SELECT * FROM restock_history LIMIT 5;
```

**Expected result:** Empty table (no rows yet) but no errors

---

### Test 3: Check Views
```sql
-- Run this in SQL Editor
SELECT * FROM low_stock_rewards;
```

**Expected result:** Shows rewards with low stock (or empty if all have good stock)

---

### Test 4: Test Trigger
```sql
-- Run this in SQL Editor
-- First, find a reward ID
SELECT id, name, quantity, is_active FROM rewards LIMIT 1;

-- Update it to 0 (replace 'your-reward-id' with actual ID)
UPDATE rewards 
SET quantity = 0 
WHERE id = 'your-reward-id';

-- Check if is_active became false
SELECT id, name, quantity, is_active FROM rewards WHERE id = 'your-reward-id';
```

**Expected result:** `is_active` should now be `false`

---

## ⚠️ Common Issues and Solutions

### Issue 1: "Column already exists"
**Error:** `column "is_active" of relation "rewards" already exists`

**Cause:** Migration was already run

**Solution:** This is safe! The `IF NOT EXISTS` clause prevents errors. Just ignore and continue.

---

### Issue 2: "Table rewards does not exist"
**Error:** `relation "rewards" does not exist`

**Cause:** Base schema not set up yet

**Solution:** 
1. First run: `supabase/schema.sql` (the main schema)
2. Then run: `supabase/inventory-management.sql` (this migration)

---

### Issue 3: "Permission denied"
**Error:** `permission denied for table rewards`

**Cause:** Wrong database credentials or insufficient permissions

**Solution:**
1. Check your Supabase project settings
2. Verify you're using the correct connection string
3. Make sure you're logged in as admin/owner

---

### Issue 4: "Syntax error"
**Error:** `syntax error at or near "..."`

**Cause:** Copy/paste may have corrupted the SQL

**Solution:**
1. Re-download or re-copy the SQL file
2. Make sure you copied the ENTIRE file
3. Check for any extra characters at beginning/end

---

## 🎓 Understanding What Happened

After running the migration, your database now has:

### 1. Enhanced Rewards Table
```
Every reward now has:
- is_active (controls if users can claim it)
- low_stock_threshold (when to show alert)
- last_restocked_at (tracking timestamp)
```

### 2. History Tracking
```
Every restock operation creates a record:
- Who did it
- When they did it
- How much they added
- What the quantities were
```

### 3. Automatic Protection
```
Quantity = 0:
  ↓
Trigger fires
  ↓
is_active = false
  ↓
Users can't claim it
  ↓
(Protection activated automatically!)
```

### 4. Easy Alerts
```
Query: SELECT * FROM low_stock_rewards;
  ↓
Get all items below threshold
  ↓
Show alerts in admin panel
```

---

## 🔄 Migration Flow Diagram

```
┌─────────────────────────────────────────────────┐
│  1. You copy SQL from file                      │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  2. Paste into Supabase SQL Editor              │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  3. Click "Run"                                 │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  4. Database executes SQL commands:             │
│     - ALTER TABLE (add columns)                 │
│     - CREATE TABLE (new table)                  │
│     - CREATE INDEX (speed up queries)           │
│     - CREATE VIEW (saved queries)               │
│     - CREATE TRIGGER (automatic code)           │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  5. Database structure updated                  │
│     ✅ New columns added                        │
│     ✅ New table created                        │
│     ✅ Triggers active                          │
│     ✅ Views available                          │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  6. Application can now use new features!       │
│     - Call inventory API endpoints              │
│     - Triggers run automatically                │
│     - History gets logged                       │
└─────────────────────────────────────────────────┘
```

---

## 📝 Best Practices

### ✅ DO:
- ✅ Run migrations in this order: development → staging → production
- ✅ Test the migration on a copy of your database first
- ✅ Keep migration files in version control (git)
- ✅ Use `IF NOT EXISTS` to make migrations idempotent (safe to run multiple times)
- ✅ Backup your database before running migrations

### ❌ DON'T:
- ❌ Don't modify old migration files after they've been run
- ❌ Don't run migrations directly on production without testing
- ❌ Don't delete migration files (they're your history)
- ❌ Don't skip migrations (run them in order)

---

## 🎯 Real-World Example

**Scenario:** You have 100 rewards in your database

**Before Migration:**
```
rewards table:
  - iPhone 15: quantity = 10 (users can claim it)
  - BMW M4: quantity = 0 (users can STILL claim it! ❌ Problem!)
```

**After Migration:**
```
rewards table:
  - iPhone 15: quantity = 10, is_active = true (users can claim ✅)
  - BMW M4: quantity = 0, is_active = false (users CAN'T claim ✅ Fixed!)
```

**When you restock BMW M4:**
```
1. Admin restocks: quantity = 5
2. Trigger detects: quantity went from 0 → 5
3. Trigger activates: is_active = true
4. History logs: "Admin restocked BMW M4: +5"
5. Users can now claim BMW M4 again!
```

---

## 📚 Additional Resources

### Learn More About:
- **SQL Basics:** [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- **Database Triggers:** [Trigger Documentation](https://www.postgresql.org/docs/current/triggers.html)
- **Supabase:** [Supabase Docs](https://supabase.com/docs)
- **Database Design:** [Database Design Basics](https://www.guru99.com/database-design.html)

---

## ✅ Checklist: Did Migration Work?

After running the migration, verify:

- [ ] No red error messages in SQL Editor
- [ ] `rewards` table has 3 new columns
- [ ] `restock_history` table exists
- [ ] `low_stock_rewards` view exists
- [ ] `out_of_stock_rewards` view exists
- [ ] Can query: `SELECT * FROM restock_history;`
- [ ] Can query: `SELECT * FROM low_stock_rewards;`
- [ ] Trigger works (test by setting quantity to 0)

---

## 🎊 Congratulations!

You now understand:
- ✅ What database migrations are
- ✅ Why we need them
- ✅ How to run them
- ✅ What our specific migration does
- ✅ How to verify it worked

**You're ready to run the migration!** 🚀

---

**Need help?** Check the Troubleshooting section or review `SETUP_INVENTORY.md` for more details.
