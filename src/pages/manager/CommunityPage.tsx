import { FormEvent, useState } from 'react'
import AdminShell from '../../components/AdminShell'
import { communityStore } from '../../store/community'

function CommunityContent() {
  const [rows, setRows] = useState(() => communityStore.list())
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    communityStore.add(title.trim(), body.trim())
    setTitle('')
    setBody('')
    setRows(communityStore.list())
  }

  return (
    <>
      <h1 className="sr-only">커뮤니티 공지</h1>
      <form className="admin-crud-form" onSubmit={onSubmit} aria-label="공지 등록">
        <label>
          제목
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          내용
          <input value={body} onChange={(e) => setBody(e.target.value)} required />
        </label>
        <button type="submit">등록</button>
      </form>
      <ul aria-label="공지 목록">
        {rows.map((n) => (
          <li key={n.id}>
            <strong>{n.title}</strong> — {n.body}
          </li>
        ))}
      </ul>
    </>
  )
}

export default function CommunityPage() {
  return (
    <AdminShell title="커뮤니티 공지">
      <CommunityContent />
    </AdminShell>
  )
}
