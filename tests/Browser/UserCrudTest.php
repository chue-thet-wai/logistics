<?php

namespace Tests\Browser;

use App\Models\User;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class UserCrudTest extends DuskTestCase
{
    protected $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Make sure you have a user with the Admin role
        $this->adminUser = User::firstOrCreate([
            'email' => 'admin@email.com'
        ], [
            'name' => 'Admin',
            'password' => bcrypt('admin123'),
        ]);
    }

    public function test_admin_can_view_users()
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->adminUser)
                ->visit('/users')
                ->assertPathIs('/users');
        });
    }

    public function test_admin_can_create_user()
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->adminUser)
                ->visit('/users/create')
                ->type('input[name=name]', 'Dusk Test User')
                ->type('input[name=email]', 'duskuser@example.com')
                ->type('input[name=password]', 'password123')
                ->type('input[name=password_confirmation]', 'password123')
                ->click('button[type=submit]')
                ->waitForLocation('/users');
        });
    }

    public function test_admin_can_edit_user()
    {
        $email = 'duskuser@example.com';
        $newName = 'Dusk Edited User';

        $user = User::firstOrCreate(['email' => $email], [
            'name' => 'Dusk Test User',
            'password' => bcrypt('password123'),
        ]);

        $this->browse(function (Browser $browser) use ($user, $newName) {
            $browser->loginAs($this->adminUser)
                ->visit("/users/{$user->id}/edit")
                ->assertInputValue('input[name=name]', $user->name)
                ->type('input[name=name]', $newName)
                ->type('input[name=email]', $user->email) 
                ->click('button[type=submit]')
                ->waitForLocation('/users');
        });
    }

    public function test_admin_can_delete_user()
    {
        $email = 'duskuser@example.com';
        $user = User::firstOrCreate(['email' => $email], [
            'name' => 'Dusk Test User',
            'password' => bcrypt('password123'),
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($this->adminUser)
                ->visit('/users')
                ->waitFor('[data-testid="delete-btn-' . $user->id . '"]')
                ->click('[data-testid="delete-btn-' . $user->id . '"]')
                ->whenAvailable('.modal', function ($modal) {
                    $modal->click('[data-testid="confirm-delete"]');
                })
                ->waitUntilMissing('.modal')
                ->waitForLocation('/users');
        });
    }
}
