# Hide Admin Login Inside the Word "knowingly"

## File: `app/privacy/page.tsx`

## What to Change:

Find section 7 (Children's Privacy) around line 130 and change this line:

**FROM:**
```tsx
not knowingly collect personal information from children under 18.
```

**TO:**
```tsx
not{" "}
<button
  onClick={() => setShowAdminLogin(!showAdminLogin)}
  className="text-muted hover:text-white transition"
>
  knowingly
</button>{" "}
collect personal information from children under 18.
```

## Result:

The word "knowingly" becomes clickable but looks exactly like regular text. When clicked, it reveals the admin login form below.

**Maximum stealth achieved!** Nobody will ever suspect that clicking a random word in the privacy policy opens the admin login. 🥷

## Full Section Should Look Like:

```tsx
<p className="mt-2 text-sm text-muted">
  Our service is not intended for users under 18 years of age. We do
  not{" "}
  <button
    onClick={() => setShowAdminLogin(!showAdminLogin)}
    className="text-muted hover:text-white transition"
  >
    knowingly
  </button>{" "}
  collect personal information from children under 18.
</p>

{showAdminLogin && (
  <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
    {/* Login form here */}
  </div>
)}
```
