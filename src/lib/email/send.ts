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
}) {
  const resend = getResend()

  await resend.emails.send({
    from: 'Blue Connect Eikaiwa <noreply@blueconnect.jp>',
    to: params.to,
    subject: '今週の学習レポート',
    html: `
      <h2>${params.name}さんの今週の学習レポート</h2>
      <ul>
        <li>連続学習: ${params.streakDays}日</li>
        <li>獲得XP: ${params.xpEarned}</li>
        <li>完了レッスン: ${params.lessonsCompleted}回</li>
        <li>学習時間: ${params.minutesPracticed}分</li>
      </ul>
      <p>来週も頑張りましょう！</p>
      <p>Blue Connect Eikaiwa</p>
    `,
  })
}
