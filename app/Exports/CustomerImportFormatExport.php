<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;

class CustomerImportFormatExport implements FromArray
{
    public function array(): array
    {
        return [
            [
                'name_en', 'name_mm', 'nationality', 'dob', 'sex',
                'nrc_no', 'passport_no', 'passport_expiry', 'visa_type', 'visa_expiry',
                'ci_no', 'ci_expiry', 'pink_card_no', 'pink_card_expiry',
                'phone', 'phone_secondary','email', 'address'
            ]
        ];
    }
}
