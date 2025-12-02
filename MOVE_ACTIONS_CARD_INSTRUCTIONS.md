# Move Actions Card Between Match Status and Key Info

## What to do:
Move the "Actions" card (with the Join Tournament button) to be positioned between the "Match Status" card and the "Key Info" card in the sidebar.

## Steps:

1. Open `app/tournaments/[id]/page.tsx`

2. Find the "Actions" card section (around line 635-686):
```tsx
<div className="rounded-3xl border border-white/10 bg-[#080f0c] p-5">
  <h3 className="text-sm font-semibold text-white">Actions</h3>
  <div className="mt-4 space-y-3 text-xs sm:text-sm">
    {canRegister && (
      <button...>
        ...Join Slot button...
      </button>
    )}
    ...other action states...
  </div>
</div>
```

3. **CUT** this entire `<div>` block (from line 635 to 686)

4. Find the "Match Status" card closing `</div>` (around line 571)

5. **PASTE** the Actions card block right after the Match Status card's closing `</div>` and before the "Key Info" card

## Result:
The sidebar order will be:
1. Match Status (with timer)
2. **Actions** (Join Tournament button) ← MOVED HERE
3. Key Info (Status, Mode, Category, etc.)

## Visual Layout:
```
┌─────────────────┐
│  Match Status   │
│  (Timer)        │
└─────────────────┘
┌─────────────────┐
│  Actions        │ ← NEW POSITION
│  [Join Button]  │
└─────────────────┘
┌─────────────────┐
│  Key Info       │
│  (Details)      │
└─────────────────┘
```

This will work on both mobile and desktop automatically since it's just reordering the cards in the sidebar.
