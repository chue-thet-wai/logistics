<?php

namespace Tests\Browser;

use App\Models\User;
use App\Models\Service;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use Tests\Browser\Traits\RoleChecks;

class ServiceCrudTest extends DuskTestCase
{
    use RoleChecks;

    protected $agentUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->agentUser = User::firstOrCreate(
            ['email' => 'agent@email.com'],
            [
                'name' => 'Agent One',
                'password' => bcrypt('test12345'),
                'role' => 'Agent',
            ]
        );
    }

    public function test_agent_can_view_services()
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->agentUser)
                    ->visit('/services')
                    ->assertPathIs('/services');
        });
    }

    public function test_agent_can_create_service()
    {
        $this->browse(function (Browser $browser) {
            //dd($browser->driver->getPageSource());

            $browser->loginAs($this->agentUser)
                    ->visit('/services/create')
                    ->pause(3000)
                    ->assertPathIs('/services/create')
                    ->select('select[name=category_id]', '1')
                    ->type('input[name=title]', 'Test Dusk Service')
                    //->type('textarea[name=detail]', 'Dusk service detail')
                    ->type('input[name=duration]', '30 minutes')
                    ->type('input[name=cost]', '99.99')
                    ->select('select[name=status]', '1')
                    ->click('button[type=submit]')
                    ->waitForLocation('/services');
        });
    }

    public function test_agent_can_edit_service()
    {
        
        $service = Service::firstOrCreate(['title' => 'Test Dusk Service']);

        $this->browse(function (Browser $browser) use ($service) {
            $browser->loginAs($this->agentUser);

            $browser->visit("/services/{$service->id}/edit")
                ->type('input[name=title]', 'Updated Dusk Service')
               // ->type('textarea[name=detail]', 'Updated Detail')
                ->type('input[name=duration]', '45 minutes')
                ->type('input[name=cost]', '149.99')
                ->select('select[name=status]', '1')
                ->click('button[type=submit]')
                ->waitForLocation('/services');
        });
    }

    public function test_agent_can_delete_service()
    {
        $service = Service::where('title', 'Updated Dusk Service')->first();

        if (!$service) {
            $this->markTestSkipped('No service to delete.');
            return;
        }

        $this->browse(function (Browser $browser) use ($service) {
            $browser->loginAs($this->agentUser)
                    ->visit('/services')
                    ->waitFor('[data-testid="delete-btn-' . $service->id . '"]')
                    ->click('[data-testid="delete-btn-' . $service->id . '"]')
                    ->whenAvailable('.modal', function ($modal) {
                        $modal->click('[data-testid="confirm-delete"]');
                    })
                    ->waitUntilMissing('.modal')
                    ->waitForLocation('/services');
        });
    }
}
