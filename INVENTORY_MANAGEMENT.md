# Inventory Management System

This document explains the new inventory management features added to the admin panel.

## Features

### 1. **Bulk Quantity Updates**
- Update multiple reward quantities at once from a single interface
- Quick input fields for each reward
- One-click apply for all changes
- Visual status indicators (In Stock, Low Stock, Out of Stock)

### 2. **Out-of-Stock Alerts**
- Automatic detection of rewards with 0 quantity
- Visual alerts banner showing count of out-of-stock items
- Dedicated alerts tab with out-of-stock and low-stock sections
- One-click restock functionality

### 3. **Automatic Disabling of Out-of-Stock Items**
- Database trigger automatically sets `is_active = false` when quantity reaches 0
- Automatically reactivates when quantity is restocked above 0
- Prevents users from claiming unavailable rewards
- Admin can manually override active status if needed

### 4. **Restock History Tracking**
- Complete audit trail of all restocking activities
- Records:
  - Date and time of restock
  - Reward name
  - Previous quantity
  - Added quantity
  - New total quantity
  - Admin who performed the restock
  - Optional notes
- Automatic logging via database trigger
- View history for all rewards or filter by specific reward

### 5. **Low Stock Threshold Alerts**
- Configurable threshold per reward (default: 5)
- Visual warnings when stock falls below threshold
- Proactive alerts to prevent stockouts

## Database Schema

### New Tables

#### `restock_history`
```sql
- id (UUID, Primary Key)
- reward_id (UUID, Foreign Key to rewards)
- previous_quantity (INTEGER)
- added_quantity (INTEGER)
- new_quantity (INTEGER)
- restocked_by (VARCHAR)
- notes (TEXT)
- created_at (TIMESTAMP)
```

### New Columns in `rewards` Table

```sql
- is_active (BOOLEAN, default: true)
- low_stock_threshold (INTEGER, default: 5)
- last_restocked_at (TIMESTAMP)
```

### Database Views

#### `low_stock_rewards`
Shows all active rewards where `quantity <= low_stock_threshold`

#### `out_of_stock_rewards`
Shows all active rewards where `quantity = 0`

### Database Triggers

#### `trigger_auto_deactivate_out_of_stock`
- Automatically sets `is_active = false` when quantity becomes 0
- Automatically sets `is_active = true` when restocked from 0

#### `trigger_log_restock_history`
- Automatically logs entry to `restock_history` when quantity increases
- Updates `last_restocked_at` timestamp

## API Endpoints

### `/api/admin/inventory`

#### GET - Fetch inventory data
**Query Parameters:**
- `action=low-stock` - Get all low stock items
- `action=out-of-stock` - Get all out-of-stock items
- `action=restock-history` - Get restock history (optional: `rewardId` for specific reward)
- `action=alerts-summary` - Get summary of all alerts

#### POST - Inventory actions
**Actions:**

1. **Bulk Update**
```json
{
  "action": "bulk-update",
  "updates": [
    { "id": "reward-uuid-1", "quantity": 100 },
    { "id": "reward-uuid-2", "quantity": 50 }
  ]
}
```

2. **Restock Single Item**
```json
{
  "action": "restock",
  "rewardId": "reward-uuid",
  "quantity": 50,
  "notes": "Weekly restock",
  "restockedBy": "admin"
}
```

3. **Set Low Stock Threshold**
```json
{
  "action": "set-threshold",
  "rewardId": "reward-uuid",
  "threshold": 10
}
```

4. **Toggle Active Status**
```json
{
  "action": "toggle-active",
  "rewardId": "reward-uuid",
  "isActive": false
}
```

## How to Use

### Setup Database

1. Run the inventory management SQL script:
```bash
# In Supabase SQL Editor or psql
psql -U your_user -d your_database -f supabase/inventory-management.sql
```

### Access Inventory Management

1. Log in to admin panel at `/admin`
2. Navigate to the dashboard at `/admin/dashboard`
3. Click the **"📦 Manage Inventory"** button in the top right

### Bulk Update Quantities

1. Open Inventory Management
2. Go to "📊 Bulk Update" tab
3. Enter new quantities in the input fields
4. Click "Apply X Updates" button
5. System updates all rewards and shows success/failure count

### Restock an Item

**Method 1: From Bulk Update Tab**
1. Click "+ Restock" button next to any reward
2. Enter quantity to add
3. Add optional notes
4. Click "Confirm Restock"

**Method 2: From Alerts Tab**
1. Go to "🚨 Alerts" tab
2. Find out-of-stock or low-stock item
3. Click "Restock" or "Restock Now" button
4. Enter quantity and notes
5. Click "Confirm Restock"

### View Restock History

1. Open Inventory Management
2. Go to "📜 Restock History" tab
3. View complete audit trail of all restocking activities
4. See who restocked, when, and how much

## Benefits

✅ **Prevents Stockouts**: Proactive alerts before items run out
✅ **Saves Time**: Bulk updates instead of editing one-by-one
✅ **Audit Trail**: Complete history of all inventory changes
✅ **Automatic Protection**: Auto-disable prevents claiming unavailable items
✅ **Better Planning**: Track patterns and restock cycles
✅ **Accountability**: Records who performed each restock

## Future Enhancements

Potential improvements for future versions:
- Export restock history to CSV/Excel
- Email notifications for low stock alerts
- Automatic reorder suggestions based on claim patterns
- Integration with suppliers for automatic ordering
- Forecasting based on historical data
- Multi-location inventory tracking
- Batch import/export for bulk operations
