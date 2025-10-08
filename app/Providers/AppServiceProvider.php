<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\UserRepository;
use App\Repositories\Contracts\ClassRepositoryInterface;
use App\Repositories\ClassRepository;
use App\Repositories\Contracts\ExtracurricularRepositoryInterface;
use App\Repositories\ExtracurricularRepository;
use App\Repositories\Contracts\HomeroomRepositoryInterface;
use App\Repositories\HomeroomRepository;
use App\Repositories\Contracts\StaffRepositoryInterface;
use App\Repositories\StaffRepository;
use App\Repositories\Contracts\SubjectRepositoryInterface;
use App\Repositories\SubjectRepository;
use App\Repositories\Contracts\SubjectAssignmentRepositoryInterface;
use App\Repositories\SubjectAssignmentRepository;
use App\Repositories\Contracts\ContactRepositoryInterface;
use App\Repositories\ContactRepository;
use App\Repositories\Contracts\FacilityRepositoryInterface;
use App\Repositories\FacilityRepository;
use App\Repositories\Contracts\PageRepositoryInterface;
use App\Repositories\PageRepository;
use App\Models\User;
use App\Observers\UserObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind Repository interfaces to concrete implementations
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(ClassRepositoryInterface::class, ClassRepository::class);
        $this->app->bind(ExtracurricularRepositoryInterface::class, ExtracurricularRepository::class);
        $this->app->bind(HomeroomRepositoryInterface::class, HomeroomRepository::class);
        $this->app->bind(StaffRepositoryInterface::class, StaffRepository::class);
        $this->app->bind(SubjectRepositoryInterface::class, SubjectRepository::class);
        $this->app->bind(SubjectAssignmentRepositoryInterface::class, SubjectAssignmentRepository::class);
        $this->app->bind(ContactRepositoryInterface::class, ContactRepository::class);
        $this->app->bind(FacilityRepositoryInterface::class, FacilityRepository::class);
        $this->app->bind(PageRepositoryInterface::class, PageRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register User Observer
        User::observe(UserObserver::class);
        
        // Work Items Authorization Gates
        Gate::define('manage-work-items', function (User $user) {
            return in_array($user->role, ['super_admin', 'headmaster']);
        });
        
        Gate::define('view-work-stats', function (User $user) {
            return in_array($user->role, ['super_admin', 'headmaster']);
        });
        
        Gate::define('create-required-work-items', function (User $user) {
            return in_array($user->role, ['super_admin', 'headmaster']);
        });
        
        // Staff Overview Authorization Gates
        Gate::define('view-staff-overview', function (User $user) {
            return $user->role === 'headmaster';
        });
        
        Gate::define('provide-feedback', function (User $user) {
            return $user->role === 'headmaster';
        });
    }
}
