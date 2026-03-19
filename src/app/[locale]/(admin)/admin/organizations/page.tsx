import { requireAdmin } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'

export default async function AdminOrganizationsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: organizations } = await supabase
    .from('organizations')
    .select('*, members:organization_members(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">法人管理</h1>
      </div>

      {!organizations || organizations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>登録されている法人はありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {organizations.map((org) => (
            <div key={org.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{org.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    プラン: {org.plan} / 席数: {org.max_seats}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(org.created_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
