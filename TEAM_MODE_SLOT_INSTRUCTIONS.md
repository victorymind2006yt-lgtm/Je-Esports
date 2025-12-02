# Team Mode Slot Design Instructions

## What to Add:

### 1. Team Mode Notice (Add after line 395, before the slots display)

Add this notice box for duo/squad/clash-squad modes:

```tsx
{/* Team Mode Notice - Add this AFTER line 395 */}
{tournament.mode !== 'solo' && (
  <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
    <div className="flex items-start gap-2">
      <Info className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
      <div className="text-xs text-amber-200">
        <p className="font-semibold mb-1">⚠️ Team Mode Registration</p>
        <p className="text-amber-200/80">
          • Only the <strong>team leader</strong> should register here<br/>
          • The leader will invite teammates in-game<br/>
          • Each slot represents one team of {tournament.mode === 'duo' ? '2' : tournament.mode === 'squad' ? '4' : '4'} players
        </p>
      </div>
    </div>
  </div>
)}
```

### 2. Update Slot Counter Text (Line 414-416)

Replace:
```tsx
<span>
  Slots ({registrations.length} / {tournament.maxSlots} filled)
</span>
```

With:
```tsx
<span>
  {tournament.mode === 'solo' 
    ? `Slots (${registrations.length} / ${tournament.maxSlots} filled)`
    : `Teams (${registrations.length} / ${tournament.maxSlots} filled)`
  }
</span>
```

### 3. Update "Your Slot" Text (Line 418-420)

Replace:
```tsx
<span className="font-semibold text-emerald-300">
  Your slot: #{userRegistration.slotNumber}
</span>
```

With:
```tsx
<span className="font-semibold text-emerald-300">
  Your {tournament.mode === 'solo' ? 'slot' : 'team'}: #{userRegistration.slotNumber}
</span>
```

### 4. Update Slot Labels (Line 470-471)

Replace:
```tsx
<span className="text-[10px] uppercase tracking-[0.18em] text-white/50">
  Slot {slotNumber}
</span>
```

With:
```tsx
<span className="text-[10px] uppercase tracking-[0.18em] text-white/50">
  {tournament.mode === 'solo' ? `Slot ${slotNumber}` : `Team ${slotNumber}`}
</span>
```

## Visual Result:

For **Solo Mode**:
- No warning notice
- Shows "Slots (X / Y filled)"
- Shows "Slot 1", "Slot 2", etc.

For **Duo/Squad/Clash-Squad**:
- ⚠️ Amber warning box at top explaining team registration
- Shows "Teams (X / Y filled)"
- Shows "Team 1", "Team 2", etc.
- Clear instructions that only team leader registers

This makes it crystal clear to users that team modes work differently!
