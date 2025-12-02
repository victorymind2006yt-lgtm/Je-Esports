# Tournament Status Management

The tournament system now automatically manages tournament statuses based on time:

## Tournament Status Lifecycle

Tournaments progress through the following statuses automatically:

1. **Upcoming** → **Ongoing**: When the start time is reached
2. **Ongoing** → **Completed**: When the end time is reached
3. **Completed** → **Awaiting Payout**: 1 minute after the tournament ends
4. **Awaiting Payout** → **Paid**: After admin distributes prizes (manual action)

## Status Descriptions

- **Upcoming**: Tournament is scheduled but hasn't started yet
- **Ongoing**: Tournament is currently in progress
- **Completed**: Tournament has ended, results are being finalized
- **Awaiting Payout**: Tournament is ready for prize distribution
- **Paid**: Prizes have been distributed to winners
- **Cancelled**: Tournament was cancelled by admin (manual action)

## How It Works

1. The `tournamentStateManager.ts` utility handles automatic status updates
2. Status checks occur:
   - When tournaments are loaded on the browse page
   - Every 15 seconds in the client UI
   - On individual tournament detail pages (real-time)
   - Via the `/api/update-tournament-states` endpoint

## API Route

- **Endpoint**: `/api/update-tournament-states`
- **Method**: GET or POST
- **Purpose**: Updates all tournament states based on current time
- **Usage**: Can be called by CRON jobs for reliable server-side updates

### Recommended CRON Schedule
Set up a CRON job to call this endpoint every minute:
```
* * * * * curl https://your-domain.com/api/update-tournament-states
```

## Admin Actions

### Automatic (No Action Required)
- Upcoming → Ongoing
- Ongoing → Completed  
- Completed → Awaiting Payout

### Manual Actions Required
- **Prize Distribution**: In the admin dashboard, go to the tournament and distribute prizes to move from "Awaiting Payout" to "Paid"
- **Cancellation**: Manually cancel a tournament if needed

## Notes for Admins

- Set accurate start and end times when creating tournaments
- The system automatically handles status transitions based on time
- Monitor the "Awaiting Payout" status to distribute prizes promptly
- Prize distribution should be completed within a reasonable timeframe

This system ensures players always see the correct tournament status in real-time.

