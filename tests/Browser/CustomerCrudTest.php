<?php

namespace Tests\Browser;

use App\Models\User;
use App\Models\Customer;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use Illuminate\Support\Facades\Hash;

class CustomerCrudTest extends DuskTestCase
{
    protected $agentUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create an agent user for testing
        $this->agentUser = User::firstOrCreate([
            'email' => 'agent@email.com',
        ], [
            'name' => 'Agent One',
            'password' => Hash::make('test12345'),     
            'role'     => 'Agent'     
        ]);
    }

    public function test_agent_can_view_customers()
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->agentUser)
                ->visit('/customers')
                ->assertPathIs('/customers');
        });
    }

    public function test_agent_can_create_customer()
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->agentUser)
                ->visit('/customers/create')
                ->type('input[name=name_eng]', 'Dusk Customer')
                ->type('input[name=email]', 'customerdusk@email.com')
                ->type('input[name=phone_primary]', '0912345678')
                ->type('input[name=dob]', '01/01/1990')
                ->type('textarea[name=current_address]', '123 Dusk Street')
                ->type('input[name=name_mm]', 'test mm')
                ->type('input[name=nationality]', 'Myanmar')
                ->select('select[name=sex]', 'Male')
                ->select('select[name=state]', '1')
                ->select('select[name=township]', 'KAPATA')
                ->select('select[name=citizen]', 'နိုင်')
                ->type('input[name=nrc]', '123456')
                ->type('input[name=passport_no]', 'P1234567')
                ->type('input[name=passport_expiry]', '01/01/2030')
                ->type('input[name=visa_type]', 'Work')
                ->type('input[name=visa_expiry]', '01/05/2027')
                ->type('input[name=ci_no]', 'CI888888')
                ->type('input[name=ci_expiry]', '01/01/2028')
                ->type('input[name=pink_card_no]', 'PC444444')
                ->type('input[name=pink_card_expiry]', '01/06/2027')
                ->type('input[name=phone_secondary]', '0987654321')
                ->click('button[type=submit]')
                ->waitForLocation('/customers')
                ->assertPathIs('/customers');
        });
    }

    public function test_agent_can_edit_customer()
    {
        $email = 'customerdusk@email.com';

        $customer = Customer::whereHas('user', function ($query) use ($email) {
            $query->where('email', $email);
        })->firstOrFail();

        $this->browse(function (Browser $browser) use ($customer) {
            $browser->loginAs($this->agentUser)
                ->visit("/customers/{$customer->id}/edit")
                ->assertInputValue('name_eng', $customer->user->name ?? '')
                ->type('input[name=name_eng]', 'Updated Dusk Customer')
                ->type('input[name=phone_primary]', '0999999999')
                ->type('input[name=dob]', '05/05/1985')
                ->type('textarea[name=current_address]', '456 Updated Road')
                ->type('input[name=name_mm]', 'test update mm')
                ->type('input[name=nationality]', 'Burmese')
                ->select('select[name=sex]', 'Female')
                ->select('select[name=state]', '2')
                ->select('select[name=township]', 'PHAYASA')
                ->select('select[name=citizen]', 'နိုင်')
                ->type('input[name=nrc]', '789067')
                ->type('input[name=passport_no]', 'P7654321')
                ->type('input[name=passport_expiry]', '01/06/2035')
                ->type('input[name=visa_type]', 'Business')
                ->type('input[name=visa_expiry]', '01/04/2034')
                ->type('input[name=ci_no]', 'CI777777')
                ->type('input[name=ci_expiry]', '01/03/2033')
                ->type('input[name=pink_card_no]', 'PC333333')
                ->type('input[name=pink_card_expiry]', '01/04/2032')
                ->type('input[name=phone_secondary]', '0977777777')
                ->click('button[type=submit]')
                ->waitForLocation('/customers')
                ->assertPathIs('/customers');
        });
    }

    /*public function test_agent_can_delete_customer()
    {
        $email = 'customerdusk@email.com';

        $customer = Customer::whereHas('user', function ($query) use ($email) {
            $query->where('email', $email);
        })->firstOrFail();

        $this->browse(function (Browser $browser) use ($customer) {
            $browser->loginAs($this->agentUser)
                ->visit('/customers')
                ->waitFor('[data-testid="delete-btn-' . $customer->id . '"]')
                ->click('[data-testid="delete-btn-' . $customer->id . '"]')
                ->whenAvailable('.modal', function ($modal) {
                    $modal->click('[data-testid="confirm-delete"]');
                })
                ->waitUntilMissing('.modal')
                ->waitForLocation('/customers')
                ->assertPathIs('/customers');
        });
    }*/
}
