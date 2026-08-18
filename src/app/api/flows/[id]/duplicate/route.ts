import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole, toErrorResponse } from '@/lib/auth/account'
import { supabaseAdmin } from '@/lib/flows/admin-client'

/**
 * POST /api/flows/[id]/duplicate — Clone a flow (header + all nodes)
 * into a new draft owned by the caller.
 */

async function requireOwnership(
  flowId: string,
): Promise<
  | {
      ok: true
      userId: string
      supabase: Awaited<ReturnType<typeof createClient>>
    }
  | { ok: false; status: number; body: { error: string } }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, status: 401, body: { error: 'Unauthorized' } }
  }
  const { data: flow } = await supabase
    .from('flows')
    .select('id')
    .eq('id', flowId)
    .maybeSingle()
  if (!flow) {
    return { ok: false, status: 404, body: { error: 'Not found' } }
  }
  return { ok: true, userId: user.id, supabase }
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params

  try {
    await requireRole('agent')
  } catch (err) {
    return toErrorResponse(err)
  }

  const guard = await requireOwnership(id)
  if (!guard.ok) {
    return NextResponse.json(guard.body, { status: guard.status })
  }
  const { userId, supabase } = guard

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', userId)
    .single()
  const accountId = profile?.account_id as string | undefined
  if (!accountId) {
    return NextResponse.json(
      { error: 'Your profile is not linked to an account.' },
      { status: 403 },
    )
  }

  // Fetch the source flow + all its nodes.
  const [{ data: source }, { data: nodes }] = await Promise.all([
    supabase.from('flows').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('flow_nodes')
      .select('*')
      .eq('flow_id', id)
      .order('created_at', { ascending: true }),
  ])
  if (!source) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const admin = supabaseAdmin()

  // Create the duplicate as a draft with " (Copy)" suffix.
  const { data: dup, error: flowErr } = await admin
    .from('flows')
    .insert({
      user_id: userId,
      account_id: accountId,
      name: `${source.name} (Copy)`,
      description: source.description,
      status: 'draft',
      trigger_type: source.trigger_type,
      trigger_config: source.trigger_config,
      entry_node_id: source.entry_node_id,
      fallback_policy: source.fallback_policy,
    })
    .select()
    .single()
  if (flowErr || !dup) {
    return NextResponse.json(
      { error: flowErr?.message ?? 'Duplicate insert failed' },
      { status: 500 },
    )
  }

  // Clone all nodes.
  if (nodes && nodes.length > 0) {
    const { error: nodesErr } = await admin.from('flow_nodes').insert(
      nodes.map((n) => ({
        flow_id: dup.id,
        node_key: n.node_key,
        node_type: n.node_type,
        config: n.config,
        position_x: n.position_x,
        position_y: n.position_y,
      })),
    )
    if (nodesErr) {
      // Roll back the parent so a half-cloned flow doesn't linger.
      await admin.from('flows').delete().eq('id', dup.id)
      return NextResponse.json(
        { error: nodesErr.message },
        { status: 500 },
      )
    }
  }

  return NextResponse.json({ flow: dup }, { status: 201 })
}
