import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('fal-proxy: request received', req.method)

    const falKey = Deno.env.get('fal')
    if (!falKey) {
      console.error('fal-proxy: FAL API key not configured')
      return new Response(
        JSON.stringify({ error: 'FAL API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { endpoint, input } = body
    console.log('fal-proxy: endpoint =', endpoint)
    console.log('fal-proxy: has image_urls =', !!input.image_urls, input.image_urls?.length ?? 0)
    console.log('fal-proxy: resolution =', input.resolution, 'aspect_ratio =', input.aspect_ratio)
    if (input.image_urls?.length > 0) {
      console.log('fal-proxy: first image_url starts with =', String(input.image_urls[0]).slice(0, 50))
    }

    if (!endpoint || !input) {
      return new Response(
        JSON.stringify({ error: 'Missing endpoint or input' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Allowlist of FAL endpoints
    const allowedEndpoints = [
      'fal-ai/nano-banana-pro/edit',
      'fal-ai/nano-banana',
      'fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
      'fal-ai/index-tts-2/text-to-speech',
    ]

    if (!allowedEndpoints.includes(endpoint)) {
      return new Response(
        JSON.stringify({ error: 'Endpoint not allowed' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('fal-proxy: calling FAL API...')
    const falResponse = await fetch(`https://fal.run/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    console.log('fal-proxy: FAL response status =', falResponse.status)
    const responseData = await falResponse.json()
    console.log('fal-proxy: response =', JSON.stringify(responseData).slice(0, 500))

    return new Response(
      JSON.stringify(responseData),
      {
        status: falResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('fal-proxy: error =', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
