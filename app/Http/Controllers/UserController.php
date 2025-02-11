<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Get users by employer ID
     *
     * @param int $employer_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUsersByEmployerId($employer_id)
    {
        // Fetch users where employer_id matches
        $users = User::where('employer_id', $employer_id)->get();

        // Check if users exist
        if ($users->isEmpty()) {
            return response()->json([
                'message' => 'No users found for the given employer ID.',
            ], 404);
        }

        // Return the users as a JSON response
        return response()->json([
            'message' => 'Users fetched successfully.',
            'data' => $users,
        ], 200);
    }
}