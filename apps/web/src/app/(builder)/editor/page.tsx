'use client'

import dynamic from 'next/dynamic'

const EditorCanvas = dynamic(
  () => import('@/components/builder/EditorCanvas'),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', background: '#13131d',
                    color: 'white', fontFamily: 'sans-serif' }}>
        Loading builder...
      </div>
    )
  }
)

export default function EditorPage() {
  return <EditorCanvas />
}