import { NextResponse } from 'next/server';
import { updateUserProfile, getUserById } from '../../../../lib/database.js';

export async function PUT(request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      name, 
      email, 
      phone, 
      avatar,
      timezone,
      language,
      currency,
      currencySymbol,
      currencyCode
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('Updating user profile:', { userId, name, email, phone, timezone });

    const updatedUser = await updateUserProfile(userId, {
      name,
      email,
      phone,
      avatar,
      timezone,
      language, 
      currency,
      currencySymbol,
      currencyCode
    });

    console.log('Successfully updated user:', updatedUser);

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching user profile for:', userId);

    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Found user:', user);

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return NextResponse.json(
      { error: 'Failed to get user profile' },
      { status: 500 }
    );
  }
}