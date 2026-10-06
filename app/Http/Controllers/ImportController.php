<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\CustomersImport;
use App\Imports\DriversImport;
use App\Imports\TrucksImport;
use Inertia\Inertia;

class ImportController extends Controller
{
    public function index()
    {
        return Inertia::render('Import/Form', [
            'pageTitle' => 'Import Data'
        ]);
    }

    public function customers(Request $request)
    {
        $request->validate(['file' => 'required|mimes:xlsx,csv,xls']);

        Excel::import(new CustomersImport, $request->file('file'));

        return back()->with('success', 'Customers imported successfully');
    }

    public function drivers(Request $request)
    {
        $request->validate(['file' => 'required|mimes:xlsx,csv,xls']);

        Excel::import(new DriversImport, $request->file('file'));

        return back()->with('success', 'Drivers imported successfully');
    }

    public function trucks(Request $request)
    {
        $request->validate(['file' => 'required|mimes:xlsx,csv,xls']);

        Excel::import(new TrucksImport, $request->file('file'));

        return back()->with('success', 'Trucks imported successfully');
    }
}