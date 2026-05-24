import Anthropic from '@anthropic-ai/sdk'

const claude = new Anthropic()

export default async function AIFeed({
  storeId,
  orders
}: {
  storeId: string
  orders: any[]
}) {
  // Use Haiku — fast, cheap, perfect for short insights
  let insights: string[] = []

  try {
    const res = await claude.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: `You are Pailo, an AI business co-pilot for small store owners.
Analyze the store data and return exactly 3 short, actionable insights.
Each must be under 20 words and start with a bold label like:
"**Reorder alert:**", "**Good news:**", "**Tip:**", "**Warning:**"
Return ONLY a JSON array of 3 strings. No markdown fences. No extra text.`,
      messages: [{
        role: 'user',
        content: `Recent orders (last 10): ${JSON.stringify(orders.slice(0, 10))}
Today: ${new Date().toDateString()}
Store ID: ${storeId}`
      }]
    })

    const text = res.content[0].type === 'text' ? res.content[0].text : '[]'
    insights = JSON.parse(text)
  } catch {
    // Fallback if Claude fails or orders is empty
    insights = [
      "**Tip:** Share your store link on social media to get your first order.",
      "**Tip:** Add at least 3 products to improve your store's conversion rate.",
      "**Good news:** Your store is live — you're ready to take orders!",
    ]
  }

  return (
    <div style={{ background: 'white', border: '1px solid rgba(17,17,20,0.08)',
                  borderRadius: 10, padding: 16 }}>

      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12,
                    display: 'flex', alignItems: 'center', gap: 6 }}>
        AI Co-pilot
        <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 3,
                        background: 'rgba(45,91,227,0.08)', color: '#2d5be3',
                        fontFamily: 'monospace', letterSpacing: 1 }}>✦ PAILO</span>
      </div>

      {insights.map((msg, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0',
                               borderBottom: i < insights.length - 1
                                 ? '1px solid rgba(17,17,20,0.06)' : 'none' }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%',
                        background: '#2d5be3', color: 'white', fontSize: 9,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0 }}>✦</div>
          <p style={{ fontSize: 11, color: '#666', lineHeight: 1.6, margin: 0 }}
            dangerouslySetInnerHTML={{ __html: msg.replace(
              /\*\*(.*?)\*\*/g,
              '<strong style="color:#111">$1</strong>'
            )}} />
        </div>
      ))}
    </div>
  )
}