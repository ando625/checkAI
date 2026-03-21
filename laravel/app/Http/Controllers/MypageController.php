<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;

class MypageController extends Controller
{
    public function index(Request $request, Report $report)
    {
        $mypage = Report::with('user','comments.user')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => $mypage->items(),
            'meta' => [
                'current_page' => $mypage->currentPage(),
                'late_page' => $mypage->lastPage(),
                'total' => $mypage->total(),
            ],
        ]);

    }

    public function update(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:50'],
        ]);

        $request->user()->update([
            'name' => $request->name,
        ]);

        return response()->json($request->user());
    }


}
