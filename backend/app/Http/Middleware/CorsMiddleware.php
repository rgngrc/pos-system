<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:8000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:8000',
        ];

        $origin = $request->header('Origin');
        
        // Default headers
        $responseHeaders = [
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
            // ADDED: Accept, X-XSRF-TOKEN, and X-Requested-With are vital for Laravel/React
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, X-XSRF-TOKEN, Accept',
            'Access-Control-Max-Age' => '86400',
        ];

        if (in_array($origin, $allowedOrigins)) {
            $responseHeaders['Access-Control-Allow-Origin'] = $origin;
            $responseHeaders['Access-Control-Allow-Credentials'] = 'true';
        }

        // Handle preflight requests immediately
        if ($request->isMethod('OPTIONS')) {
            return response('', 204)->withHeaders($responseHeaders);
        }

        $response = $next($request);

        // If the response is a binary file (like an image or download), 
        // it might not have the header() method, so we check first.
        if (method_exists($response, 'header')) {
            foreach ($responseHeaders as $key => $value) {
                $response->header($key, $value);
            }
        }

        return $response;
    }
}
