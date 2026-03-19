import { requireAuth } from '@/lib/auth/guard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileForm } from '@/components/settings/profile-form'
import { AvatarUpload } from '@/components/settings/avatar-upload'
import { LearningPreferencesForm } from '@/components/settings/learning-preferences-form'
import { SubscriptionSection } from '@/components/settings/subscription-section'
import { ConnectedAccountsSection } from '@/components/settings/connected-accounts-section'
import { AccountManagementSection } from '@/components/settings/account-management-section'

export default async function SettingsPage() {
  const user = await requireAuth()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">設定</h1>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">プロフィール</TabsTrigger>
          <TabsTrigger value="learning">学習設定</TabsTrigger>
          <TabsTrigger value="subscription">サブスクリプション</TabsTrigger>
          <TabsTrigger value="connected">アカウント連携</TabsTrigger>
          <TabsTrigger value="account">アカウント管理</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-6">
          <AvatarUpload user={user} />
          <ProfileForm user={user} />
        </TabsContent>
        {/* Other tabs will be populated in subsequent tasks */}
        <TabsContent value="learning">
          <LearningPreferencesForm user={user} />
        </TabsContent>
        <TabsContent value="subscription">
          <SubscriptionSection user={user} />
        </TabsContent>
        <TabsContent value="connected">
          <ConnectedAccountsSection user={user} />
        </TabsContent>
        <TabsContent value="account">
          <AccountManagementSection user={user} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
