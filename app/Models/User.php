<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Log;
use App\Notifications\ResetPasswordNotification;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function staff()
    {
        return $this->hasOne(Staff::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function activities()
    {
        return $this->hasMany(UserActivity::class);
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * Boot the model to handle cascade delete logging.
     */
    protected static function booted()
    {
        static::deleting(function (User $user) {
            // Log information about related records that will be deleted
            if ($user->staff) {
                Log::info("Deleting user {$user->name} (ID: {$user->id}) - This will cascade delete staff record: {$user->staff->name} (ID: {$user->staff->id})");
                
                // Log position history that will be deleted
                $positionCount = $user->staff->positionHistory()->count();
                if ($positionCount > 0) {
                    Log::info("Staff deletion will cascade delete {$positionCount} position history records");
                }

                // Log subject assignments that will be deleted
                $subjectCount = $user->staff->subjects()->count();
                if ($subjectCount > 0) {
                    Log::info("Staff deletion will cascade delete {$subjectCount} subject assignments");
                }
            }
        });
    }

}
