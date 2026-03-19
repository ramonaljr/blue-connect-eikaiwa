import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

export async function sendLessonReminder(params: {
  to: string
  learnerName: string
  tutorName: string
  scheduledAt: string
  lessonUrl: string
}) {
  const resend = getResend()
  const date = new Date(params.scheduledAt).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  await resend.emails.send({
    from: 'Blue Connect Eikaiwa <noreply@blueconnect.jp>',
    to: params.to,
    subject: `レッスンリマインダー: ${date}`,
    html: `
      <h2>レッスンリマインダー</h2>
      <p>${params.learnerName}さん、</p>
      <p>${params.tutorName}先生とのレッスンが近づいています。</p>
      <p><strong>日時:</strong> ${date}</p>
      <p><a href="${params.lessonUrl}">レッスンルームに入る</a></p>
      <p>Blue Connect Eikaiwa</p>
    `,
  })
}

export async function sendWeeklySummary(params: {
  to: string
  name: string
  streakDays: number
  xpEarned: number
  lessonsCompleted: number
  minutesPracticed: number
  achievementsUnlocked?: string[] // achievement titles
  topSkill?: string // best performing skill area
  recommendation?: string // personalized recommendation
}) {
  const resend = getResend()

  const achievementSection = params.achievementsUnlocked?.length
    ? `<h3>🏆 今週の実績</h3><ul>${params.achievementsUnlocked.map(a => `<li>${a}</li>`).join('')}</ul>`
    : ''

  const recommendationSection = params.recommendation
    ? `<h3>📝 おすすめ</h3><p>${params.recommendation}</p>`
    : ''

  await resend.emails.send({
    from: 'Blue Connect Eikaiwa <noreply@blueconnect.jp>',
    to: params.to,
    subject: `📊 ${params.name}さんの今週の学習レポート`,
    html: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Blue Connect Eikaiwa</h1>
        <h2>${params.name}さんの今週の学習レポート</h2>

        <div style="background: #f0f9ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${params.xpEarned}</div>
                <div style="color: #64748b; font-size: 12px;">獲得XP</div>
              </td>
              <td style="padding: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #f97316;">🔥 ${params.streakDays}</div>
                <div style="color: #64748b; font-size: 12px;">日連続</div>
              </td>
              <td style="padding: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #22c55e;">${params.lessonsCompleted}</div>
                <div style="color: #64748b; font-size: 12px;">完了レッスン</div>
              </td>
              <td style="padding: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #8b5cf6;">${params.minutesPracticed}</div>
                <div style="color: #64748b; font-size: 12px;">学習時間(分)</div>
              </td>
            </tr>
          </table>
        </div>

        ${achievementSection}
        ${recommendationSection}

        <p>来週も頑張りましょう！💪</p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <a href="https://blueconnect.jp/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">ダッシュボードを開く</a>
        </div>

        <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
          このメールの配信を停止するには、<a href="https://blueconnect.jp/dashboard/settings">設定ページ</a>から変更できます。
        </p>
      </div>
    `,
  })
}
