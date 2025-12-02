# Reorder Sidebar Cards - Mobile View Fix

## File: `app/tournaments/[id]/page.tsx`

## Current Order (Lines 538-686):
```
<aside className="space-y-4">
  1. Match Status Card (lines 539-571)
  2. Key Info Card (lines 573-633)
  3. Actions Card (lines 635-686)
</aside>
```

## New Order Needed:
```
<aside className="space-y-4">
  1. Actions Card (MOVE THIS TO TOP)
  2. Match Status Card
  3. Key Info Card
</aside>
```

## How to Do It:

### Step 1: Cut the Actions Card
- Select lines **635 to 686** (the entire Actions card div)
- Cut it (Ctrl+X)

### Step 2: Paste at the Top
- Place cursor at line **539** (right after `<aside className="space-y-4">`)
- Paste (Ctrl+V)
- Add a blank line after it for spacing

### Result:
The mobile view will now show:
1. ✅ Actions (Join button) - FIRST
2. ✅ Match Status (Timer) - SECOND
3. ✅ Key Info - THIRD

That's it! Just cut and paste one block of code. 🎯
