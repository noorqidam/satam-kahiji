<?php

namespace App\Console\Commands;

use App\Models\Staff;
use Illuminate\Console\Command;

class PopulateStaffSlugs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'staff:populate-slugs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Populate slug column for existing staff records';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Populating staff slugs...');

        $staffWithoutSlugs = Staff::whereNull('slug')->orWhere('slug', '')->get();
        
        if ($staffWithoutSlugs->count() === 0) {
            $this->info('All staff records already have slugs.');
            return;
        }

        $bar = $this->output->createProgressBar($staffWithoutSlugs->count());
        $bar->start();

        foreach ($staffWithoutSlugs as $staff) {
            $staff->generateSlug();
            $staff->save();
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Successfully populated slugs for {$staffWithoutSlugs->count()} staff records.");
    }
}
