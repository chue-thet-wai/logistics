<?php

namespace Tests\Browser;

use App\Models\Customer;
use App\Models\User;
use App\Models\CustomerService;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class CustomerServiceCrudTest extends DuskTestCase
{
    protected $agentUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->agentUser = User::firstOrCreate([
            'email' => 'agent@email.com',
        ], [
            'name' => 'Agent One',
            'password' => Hash::make('test12345'),     
            'role'     => 'Agent'     
        ]);
    }

    public function test_agent_can_view_customer_services()
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->agentUser)
                ->visit('/customer-services')
                ->assertPathIs('/customer-services');
        });
    }

    public function test_agent_can_create_customer_services()
    {
        $email = 'customerdusk@email.com';

        $customer = Customer::whereHas('user', function ($query) use ($email) {
            $query->where('email', $email);
        })->firstOrFail();

        $this->browse(function (Browser $browser) use ($customer){
            $browser->loginAs($this->agentUser)
                ->visit('/customer-services/create')
                ->select('select[name=customer_id]', $customer->id)
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
                ->type('input[name=passport_expiry_date]', '01/01/2030')
                ->type('input[name=visa_type]', 'Work')
                ->type('input[name=visa_expiry_date]', '01/05/2027')
                ->type('input[name=ci_no]', 'CI888888')
                ->type('input[name=ci_expiry_date]', '01/01/2028')
                ->type('input[name=pink_card_no]', 'PC444444')
                ->type('input[name=pink_card_expiry_date]', '01/06/2027')
                ->type('input[name=phone_secondary]', '0987654321')
                ->select('select[name=service_id]', 1)
                ->select('select[name=status]', 2)
                ->click('button[type=submit]')
                ->waitForLocation('/customer-services')
                ->assertPathIs('/customer-services');
        });
    }

    public function test_agent_can_edit_customer_services()
    {
        $email = 'customerdusk@email.com';
        $customerService = CustomerService::with(['customer.user', 'service', 'creator'])
                    ->whereHas('customer.user', function ($query) use ($email) {
                        $query->where('email', $email);
                    })
                    ->firstOrFail();

        $this->browse(function (Browser $browser) use ($customerService) {
            $browser->loginAs($this->agentUser)
                ->visit("/customer-services/{$customerService->id}/edit")
                ->assertInputValue('name_eng', $customerService->customer->user->name ?? '')
                ->type('input[name=name_eng]', 'Updated Dusk Customer Service')
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
                ->type('input[name=passport_expiry_date]', '01/06/2035')
                ->type('input[name=visa_type]', 'Business')
                ->type('input[name=visa_expiry_date]', '01/04/2034')
                ->type('input[name=ci_no]', 'CI777777')
                ->type('input[name=ci_expiry_date]', '01/03/2033')
                ->type('input[name=pink_card_no]', 'PC333333')
                ->type('input[name=pink_card_expiry_date]', '01/04/2032')
                ->type('input[name=phone_secondary]', '0977777777')
                ->select('select[name=service_id]', 1)
                ->select('select[name=status]',5)
                ->click('button[type=submit]')
                ->waitForLocation('/customer-services')
                ->assertPathIs('/customer-services');
        });
    }

    /*public function test_agent_can_delete_customer_service()
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
