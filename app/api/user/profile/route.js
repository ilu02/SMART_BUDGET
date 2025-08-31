import { NextResponse } from 'next/server';
import { updateUserProfile } from '../../../../lib/database.js';

export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, name, email, phone, avatar } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserProfile(userId, {
      name,
      email,
      phone,
      avatar
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}