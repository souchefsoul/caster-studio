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
      'fal-ai/kling-video/v3/pro/image-to-video',
      'fal-ai/index-tts-2/text-to-speech',
    ]

    if (!allowedEndpoints.includes(endpoint)) {
      return new Response(
        JSON.stringify({ error: 'Endpoint not allowed' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const headers = {
      'Authorization': `Key ${falKey}`,
      'Content-Type': 'application/json',
    }

    // Try fal.run first (synchronous — works for most endpoints)
    console.log('fal-proxy: calling FAL API via fal.run...')
    let falResponse = await fetch(`https://fal.run/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    })

    console.log('fal-proxy: FAL response status =', falResponse.status)

    // If fal.run returns 401/422 for video endpoints, try queue API
    if (!falResponse.ok && endpoint.includes('kling-video')) {
      console.log('fal-proxy: fal.run failed, trying queue API...')

      // Submit to queue
      const submitRes = await fetch(`https://queue.fal.run/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(input),
      })

      if (!submitRes.ok) {
        const err = await submitRes.json()
        console.error('fal-proxy: queue submit failed', submitRes.status, JSON.stringify(err))
        return new Response(JSON.stringify(err), {
          status: submitRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { request_id } = await submitRes.json()
      console.log('fal-proxy: queued, request_id =', request_id)

      // Poll until completed (max ~10 min, every 5s)
      for (let i = 0; i < 120; i++) {
        await new Promise((r) => setTimeout(r, 5000))

        const statusRes = await fetch(
          `https://queue.fal.run/${endpoint}/requests/${request_id}/status`,
          { headers }
        )
        const status = await statusRes.json()
        console.log('fal-proxy: poll', i + 1, 'status =', status.status)

        if (status.status === 'COMPLETED') {
          const resultRes = await fetch(
            `https://queue.fal.run/${endpoint}/requests/${request_id}`,
            { headers }
          )
          const resultData = await resultRes.json()
          console.log('fal-proxy: result =', JSON.stringify(resultData).slice(0, 500))
          return new Response(JSON.stringify(resultData), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        if (status.status === 'FAILED') {
          return new Response(
            JSON.stringify({ error: 'Video generation failed', detail: status }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      return new Response(
        JSON.stringify({ error: 'Video generation timed out' }),
        { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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
