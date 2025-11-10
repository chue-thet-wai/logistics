<?php

namespace Tests\Browser;

use App\Models\User;
use App\Models\Category;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class CategoryCrudTest extends DuskTestCase
{
    protected $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Prepare or get admin user here
        $this->adminUser = User::firstOrCreate(
            ['email' => 'admin@email.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('admin123'),
                'role' => 'Admin', 
            ]
        );
    }

    public function test_admin_can_view_categories()
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->adminUser);
            $browser->visit('/categories')
                    ->assertPathIs('/categories');
        });
    }

    public function test_admin_can_create_category()
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->adminUser);

            $browser->visit('/categories/create')
                    ->type('input[name=name]', 'New Category Dusk Test')
                    ->click('button[type=submit]')
                    ->waitForLocation('/categories');
        });
    }

    public function test_admin_can_edit_category()
    {
        $categoryName = 'New Category Dusk Test';
        $newName = 'Edited Category Dusk';

        $category = Category::firstOrCreate(['name' => $categoryName]);

        $this->browse(function (Browser $browser) use ($category, $newName) {
            $browser->loginAs($this->adminUser);

            $browser->visit("/categories/{$category->id}/edit")
                    ->assertInputValue('input[name=name]', $category->name)
                    ->type('input[name=name]', $newName)
                    ->click('button[type=submit]')
                    ->waitForLocation('/categories');
        });
    }

    public function test_admin_can_delete_category()
    {
        $categoryName = 'Edited Category Dusk';
        $category = Category::firstOrCreate(['name' => $categoryName]);

        $this->browse(function (Browser $browser) use ($category) {
            $browser->loginAs($this->adminUser);

            $browser->visit('/categories')
                    ->waitFor('[data-testid="delete-btn-' . $category->id . '"]')
                    ->click('[data-testid="delete-btn-' . $category->id . '"]')
                    ->whenAvailable('.modal', function ($modal) {
                        $modal->click('[data-testid="confirm-delete"]');
                    })
                    ->waitUntilMissing('.modal')
                    ->waitForLocation('/categories');
        });
    }
}
