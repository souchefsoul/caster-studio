import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Client-Info, Apikey, x-fal-target-url, x-fal-queue-priority, x-fal-runner-id, x-fal-client-info',
}

const FAL_KEY = Deno.env.get('fal') || ''

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    if (!FAL_KEY) throw new Error('FAL API key is not configured')

    const targetUrl = req.headers.get('x-fal-target-url')
    if (!targetUrl) throw new Error('Missing x-fal-target-url header')

    const headers: Record<string, string> = {
      Authorization: `Key ${FAL_KEY}`,
      'Content-Type': req.headers.get('Content-Type') || 'application/json',
    }

    const fetchOptions: RequestInit = { method: req.method, headers }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const contentType = req.headers.get('Content-Type') || ''
      if (contentType.includes('multipart/form-data')) {
        fetchOptions.body = await req.arrayBuffer()
        headers['Content-Type'] = contentType
      } else {
        fetchOptions.body = await req.text()
      }
    }

    const response = await fetch(targetUrl, fetchOptions)

    const responseHeaders = new Headers(corsHeaders)
    responseHeaders.set(
      'Content-Type',
      response.headers.get('Content-Type') || 'application/json'
    )

    const body = await response.arrayBuffer()
    return new Response(body, { status: response.status, headers: responseHeaders })
  } catch (error) {
    console.error('fal-proxy error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Proxy error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
