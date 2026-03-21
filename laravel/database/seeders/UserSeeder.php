<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => '山田太郎',
            'email' => 'yamada@gmail.com',
            'password' => Hash::make('pass1234'),
        ]);

        User::create([
            'name' => '吉田正尚',
            'email' => 'yoshida@gmail.com',
            'password' => Hash::make('pass1234'),
        ]);

        User::create([
            'name' => '大谷翔平',
            'email' => 'ootani@gmail.com',
            'password' => Hash::make('pass1234'),
        ]);

        User::create([
            'name' => '鈴木誠也',
            'email' => 'suzuki@gmail.com',
            'password' => Hash::make('pass1234'),
        ]);
    }
}
