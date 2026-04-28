<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\CorsMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Keeps the connection stateful so cookies work
        $middleware->statefulApi();

        // Maintains your custom CORS logic
        $middleware->prepend(CorsMiddleware::class);

        // FIX: Exempts your auth and sales routes from CSRF protection
        // This resolves the 419 error that stops logins and sales records
        $middleware->validateCsrfTokens(except: [
            'api/login',
            'api/logout',
            'api/sales',
            'api/sales/*', // Covers specific sale IDs if needed
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();