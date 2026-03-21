<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'user_id',
        'content',
        'status',
        'score_total',
        'score_positive',
        'score_negative',
        'ai_summary',
    ];



    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
