<?php

    return [
        'statuses' => [
            ['label' => 'Active', 'value' => 1],
            ['label' => 'Inactive', 'value' => 0],
        ],
        'customer_types' => [
            ['label' => 'Individual', 'value' => 1],
            ['label' => 'Corporate', 'value' => 2],
        ],
        'checkpoint_types' => [
            ['label' => 'Start', 'value' => 'start'],
            ['label' => 'Toll', 'value' => 'toll'],
            ['label' => 'Customs', 'value' => 'customs'],
            ['label' => 'End', 'value' => 'end'],
        ],
        'categories' => [
            ['label' => 'Category One', 'value' => 1],
            ['label' => 'Category Two', 'value' => 2],
        ],
        'lead_statuses' => [
            ['label' => 'Confirm', 'value' => 1],
            ['label' => 'Pending', 'value' => 0],
        ],
        'job_statuses' => [
            ['label' => 'Pending', 'value' => 0],
            ['label' => 'Confirmed', 'value' => 1],
            ['label' => 'Assigned Driver', 'value' => 2],
        ],
        'paginate_per_page' => 10,
    ];

