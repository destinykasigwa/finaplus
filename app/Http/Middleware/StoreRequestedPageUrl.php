<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class StoreRequestedPageUrl
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check()) {
            // L'utilisateur n'est pas connecté, enregistrer l'URL demandée dans la session
            // dd($request->url());
            // $request->session()->put('requested_page_url__', $request->url());
            // $request->session()->put('returnUrl', $request->fullUrl());
            Session::put('returnUrl', url()->previous());
            // dd($request->session()->get('requested_page_url'));
            // $request->session()->save();
        }
        return $next($request);
    }
}
