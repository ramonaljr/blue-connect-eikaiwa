'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { updateAvatar } from '@/lib/actions/settings'
import type { User } from '@/lib/types/database'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AvatarUploadProps {
  user: User
}

export function AvatarUpload({ user }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fallbackChar = user.display_name?.charAt(0) ?? '?'

  function handleClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview the image immediately
    const previewUrl = URL.createObjectURL(file)
    setAvatarUrl(previewUrl)

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const result = await updateAvatar(formData)

      if (result.error) {
        toast.error(result.error)
        // Revert preview on error
        setAvatarUrl(user.avatar_url)
      } else {
        toast.success('プロフィール画像を更新しました')
        if (result.url) {
          setAvatarUrl(result.url)
        }
      }
    } catch {
      toast.error('画像のアップロードに失敗しました')
      setAvatarUrl(user.avatar_url)
    } finally {
      setLoading(false)
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>プロフィール画像</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
        >
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarUrl ?? undefined} alt={user.display_name} />
            <AvatarFallback className="text-2xl">{fallbackChar}</AvatarFallback>
          </Avatar>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <span className="text-xs text-white">アップロード中...</span>
            </div>
          )}
        </button>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            クリックして画像を変更
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, GIF（最大2MB）
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}
