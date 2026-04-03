<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use App\Http\View\Composers\ProfileComposer;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
        View::composer('partials.header', ProfileComposer::class);
        View::composer('partials.sidebar', ProfileComposer::class);
        View::composer('eco.home', ProfileComposer::class);
    }
}
