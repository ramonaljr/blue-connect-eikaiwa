'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { updatePassword, exportUserData, requestAccountDeletion } from '@/lib/actions/settings'
import type { User } from '@/lib/types/database'

export function AccountManagementSection({ user: _user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>アカウント管理</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <PasswordChangeSection />
        <Separator />
        <DataExportSection />
        <Separator />
        <AccountDeletionSection />
      </CardContent>
    </Card>
  )
}

function PasswordChangeSection() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('パスワードが一致しません')
      return
    }

    if (newPassword.length < 8) {
      toast.error('パスワードは8文字以上である必要があります')
      return
    }

    setLoading(true)
    try {
      const result = await updatePassword({ newPassword })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('パスワードを変更しました')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      toast.error('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">パスワード変更</h3>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <Input
          type="password"
          placeholder="新しいパスワード"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
        />
        <Input
          type="password"
          placeholder="新しいパスワード（確認）"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />
        <Button type="submit" size="sm" disabled={loading || !newPassword || !confirmPassword}>
          {loading ? '変更中...' : 'パスワードを変更'}
        </Button>
      </form>
    </div>
  )
}

function DataExportSection() {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const result = await exportUserData()
      if (result.error) {
        toast.error(result.error)
        return
      }

      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const date = new Date().toISOString().split('T')[0]
      const a = document.createElement('a')
      a.href = url
      a.download = `blue-connect-export-${date}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('データをエクスポートしました')
    } catch {
      toast.error('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">データエクスポート</h3>
      <p className="text-sm text-muted-foreground">
        すべての学習データをJSON形式でダウンロードできます
      </p>
      <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
        {loading ? 'エクスポート中...' : 'データをエクスポート'}
      </Button>
    </div>
  )
}

function AccountDeletionSection() {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const result = await requestAccountDeletion()
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('アカウント削除リクエストを受け付けました')
        setOpen(false)
        setConfirmText('')
      }
    } catch {
      toast.error('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-destructive/50 p-4">
      <h3 className="text-sm font-medium text-destructive">アカウント削除</h3>
      <p className="text-sm text-muted-foreground">
        アカウントを削除すると、30日後にすべてのデータが完全に削除されます。この操作は取り消せません。
      </p>
      <Dialog open={open} onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setConfirmText('')
      }}>
        <DialogTrigger render={
          <Button variant="destructive" size="sm" />
        }>
          アカウントを削除
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>アカウントを削除しますか？</DialogTitle>
            <DialogDescription>
              この操作は取り消せません。確認のため「DELETE」と入力してください。
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="DELETE"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmText !== 'DELETE' || loading}
            >
              {loading ? '処理中...' : '削除する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
