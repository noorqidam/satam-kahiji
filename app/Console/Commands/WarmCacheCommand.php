<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class WarmCacheCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:warm';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Warm up application cache for better performance';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔥 Warming up optimized application cache...');

        try {
            // Warm up home page cache
            $this->info('🏠 Warming home page cache...');
            app(\App\Http\Controllers\HomeController::class)->index();

            // Warm up contact cache
            $this->info('📞 Warming contact cache...');
            \App\Models\Contact::orderBy('created_at', 'desc')->first();

            // Warm up gallery index cache
            $this->info('🖼️ Warming gallery cache...');
            app(\App\Http\Controllers\GalleryController::class)->index(new \Illuminate\Http\Request());

            // Warm up facilities cache
            $this->info('🏢 Warming facilities cache...');
            app(\App\Http\Controllers\FacilityController::class)->index(new \Illuminate\Http\Request());

            // Warm up teachers cache
            $this->info('👨‍🏫 Warming teachers cache...');
            app(\App\Http\Controllers\TeachersController::class)->index();

            // Warm up principal cache
            $this->info('👔 Warming principal cache...');
            app(\App\Http\Controllers\PrincipalController::class)->index();

            // Warm up about page
            if (\App\Models\Page::where('slug', 'about')->exists()) {
                $this->info('📄 Warming about page cache...');
                try {
                    app(\App\Http\Controllers\PageController::class)->show('about');
                } catch (\Exception $e) {
                    $this->warn('Could not warm about page cache');
                }
            }

            // Warm up popular gallery detail pages
            $gallerySlugs = ['semangat-kebersamaan-di-hari-pramuka', 'upacara-hari-kemerdekaan-indonesia', 'peringatan-maulid-nabi-muhammad-saw', 'makan-bergizi-gratis'];
            foreach ($gallerySlugs as $slug) {
                $this->info("🖼️ Warming gallery detail cache: {$slug}");
                try {
                    app(\App\Http\Controllers\GalleryController::class)->show($slug);
                } catch (\Exception $e) {
                    $this->warn("Could not warm gallery cache for: {$slug}");
                }
            }

            $this->info('✅ Optimized cache warming completed!');
        } catch (\Exception $e) {
            $this->error('❌ Cache warming failed: ' . $e->getMessage());
        }
    }
}
