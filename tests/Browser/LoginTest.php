<?php

namespace Tests\Browser;

use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class LoginTest extends DuskTestCase
{
    public function test_user_cannot_login_with_invalid_credentials()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->pause(3000)
                ->assertPathIs('/login')
                ->waitFor('input[name=email]', 10)
                ->type('input[name=email]', 'wrong@email.com')
                ->type('input[name=password]', 'wrongpassword')
                ->click('button[type=submit]')
                ->pause(2000) 
                ->assertSee('The provided credentials do not match our records.')
                ->assertPathIs('/login'); 
        });
    }

    public function test_admin_can_login()
    {
        $this->browse(function (Browser $browser) {
           $browser->visit('/logout') 
                ->visit('/login')
                ->pause(3000)
                ->assertPathIs('/login')
                ->waitFor('input[name=email]', 10)
                ->type('input[name=email]', 'admin@email.com')
                ->type('input[name=password]', 'admin123')
                ->click('button[type=submit]')
                ->pause(2000)
                ->assertPathIs('/dashboard');
        });
    }

    /*public function test_agent_can_login()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->pause(3000)
                ->assertPathIs('/login')
                ->waitFor('input[name=email]', 10)
                ->type('input[name=email]', 'agent@email.com')
                ->type('input[name=password]', 'test12345')
                ->click('button[type=submit]')
                ->pause(2000)
                ->assertPathIs('/dashboard');
        });
    }*/
}
