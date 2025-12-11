# Quick Setup Guide - Inventory Management

## Step 1: Update Database Schema

You need to run the inventory management SQL script in your Supabase project.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase/inventory-management.sql`
5. Click **Run** to execute the script

### Option B: Using psql Command Line

```bash
psql -h your-supabase-host -U postgres -d postgres -f supabase/inventory-management.sql
```

## Step 2: Verify Installation

The script will:
- ✅ Add 3 new columns to the `rewards` table
- ✅ Create the `restock_history` table
- ✅ Create 2 database views (`low_stock_rewards`, `out_of_stock_rewards`)
- ✅ Set up 2 automatic triggers
- ✅ Configure Row Level Security policies

## Step 3: Access Inventory Management

1. Start your development server (if not already running):
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/admin`

3. Login with credentials:
   - Username: `admin`
   - Password: `admin123`

4. You'll see a new **"📦 Manage Inventory"** button in the dashboard

## What's New

### In the Admin Dashboard Header
- New blue **"Manage Inventory"** card next to "Manage Rewards"
- Quick access to inventory control features

### Inventory Management Modal (3 Tabs)

#### 1️⃣ Bulk Update Tab
- View all rewards with current stock levels
- Color-coded status indicators:
  - 🔴 Red = Out of Stock (0 items)
  - 🟡 Yellow = Low Stock (≤ threshold)
  - 🟢 Green = In Stock (> threshold)
- Input fields to update quantities
- "+ Restock" button for quick restocking
- Apply multiple updates at once

#### 2️⃣ Alerts Tab
- **Out of Stock Section**: All rewards with 0 quantity
- **Low Stock Section**: Rewards below their threshold
- Alert banner at top showing total counts
- Quick restock buttons for each item

#### 3️⃣ Restock History Tab
- Complete audit trail of all restocking activities
- Shows: Date, Reward, Previous Qty, Added Qty, New Total, Admin, Notes
- Automatically populated by database triggers

## Testing the Features

### Test 1: Bulk Update
1. Open Inventory Management
2. Go to "Bulk Update" tab
3. Change quantities for 2-3 rewards
4. Click "Apply X Updates"
5. Verify success message
6. Check that quantities updated in "Manage Rewards"

### Test 2: Restock Single Item
1. Find any reward in the list
2. Click "+ Restock" button
3. Enter quantity (e.g., 50)
4. Add notes (optional)
5. Click "Confirm Restock"
6. Verify quantity increased
7. Check "Restock History" tab to see the log entry

### Test 3: Out of Stock Auto-Disable
1. Set a reward quantity to 0 (via bulk update)
2. The reward should automatically become inactive
3. Restock it with any quantity > 0
4. The reward should automatically reactivate

### Test 4: Low Stock Alerts
1. Set a reward quantity to 3 (below default threshold of 5)
2. Go to "Alerts" tab
3. The reward should appear in "Low Stock" section
4. Alert banner should show the count

### Test 5: View History
1. Perform several restock operations
2. Go to "Restock History" tab
3. Verify all operations are logged
4. Check that details are accurate (dates, quantities, notes)

## Troubleshooting

### Database Connection Issues
- Verify `.env.local` has correct Supabase credentials:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

### SQL Script Errors
- Make sure you're running the script on the correct database
- Check that the base `rewards` table exists first
- If columns already exist, the `IF NOT EXISTS` clauses will skip them

### API Errors
- Check browser console for error messages
- Verify `/api/admin/inventory` endpoint is accessible
- Ensure Supabase RLS policies allow read/write access

### UI Not Showing
- Clear browser cache and reload
- Check that InventoryManagement component is imported
- Verify no TypeScript compilation errors

## Database Schema Reference

### New Rewards Columns
```sql
is_active              BOOLEAN  (default: true)
low_stock_threshold    INTEGER  (default: 5)
last_restocked_at      TIMESTAMP
```

### Restock History Table
```sql
id                UUID PRIMARY KEY
reward_id         UUID (FK to rewards.id)
previous_quantity INTEGER
added_quantity    INTEGER
new_quantity      INTEGER
restocked_by      VARCHAR(255)
notes             TEXT
created_at        TIMESTAMP
```

## Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Check the terminal/server logs
3. Verify database migrations ran successfully
4. Review `INVENTORY_MANAGEMENT.md` for detailed documentation
