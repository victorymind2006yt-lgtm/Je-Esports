import { NextResponse } from 'next/server';
import { updateTournamentStates } from '../../lib/tournamentStateManager';

export const dynamic = 'force-dynamic';

/**
 * API route to update tournament states based on current time
 * This can be called by a CRON job or manually to ensure tournaments
 * transition through their lifecycle states automatically
 */
export async function GET() {
  try {
    const result = await updateTournamentStates();

    return NextResponse.json({
      success: true,
      message: 'Tournament states updated successfully',
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating tournament states:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update tournament states',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Allow POST requests as well for flexibility
  return GET();
}
