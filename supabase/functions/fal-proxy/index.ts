import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const falKey = Deno.env.get('fal')
    if (!falKey) {
      return new Response(
        JSON.stringify({ error: 'FAL API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { endpoint, input } = body

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

    const falResponse = await fetch(`https://fal.run/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    const responseData = await falResponse.json()

    return new Response(
      JSON.stringify(responseData),
      {
        status: falResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
