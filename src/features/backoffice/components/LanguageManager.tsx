import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '../../../shared/api/client'
import { SectionPanel } from '../../../shared/components/SectionPanel'
import type { Language } from '../../../shared/types/content'

export function LanguageManager({ token }: { token: string }) {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // New language form state
  const [newCode, setNewCode] = useState('')
  const [newName, setNewName] = useState('')
  const [copyFrom, setCopyFrom] = useState('')
  const [creating, setCreating] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    apiClient
      .getAdminLanguages(token)
      .then(setLanguages)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleCreate = async () => {
    if (!newCode.trim() || !newName.trim()) {
      setError('กรุณากรอก Code และ Name')
      return
    }
    setCreating(true)
    setError(null)
    try {
      await apiClient.createLanguage(token, newCode.trim().toLowerCase(), newName.trim(), copyFrom || undefined)
      setNewCode('')
      setNewName('')
      setCopyFrom('')
      load()
      showSuccess(`สร้างภาษา "${newName}" เรียบร้อยแล้ว`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setCreating(false)
    }
  }

  const handleSetDefault = async (code: string) => {
    setError(null)
    try {
      await apiClient.updateLanguage(token, code, { isDefault: true })
      load()
      showSuccess('ตั้งค่าภาษาเริ่มต้นเรียบร้อยแล้ว')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  const handleToggleActive = async (lang: Language) => {
    setError(null)
    try {
      await apiClient.updateLanguage(token, lang.code, { isActive: !lang.isActive })
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  const handleDelete = async (lang: Language) => {
    if (!confirm(`ลบภาษา "${lang.name}" และเนื้อหาทั้งหมดในภาษานี้?`)) return
    setError(null)
    try {
      await apiClient.deleteLanguage(token, lang.code)
      load()
      showSuccess(`ลบภาษา "${lang.name}" เรียบร้อยแล้ว`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  if (loading) return <div className="status-page">กำลังโหลด...</div>

  return (
    <div className="language-manager">
      {error && <div className="banner banner-error">{error}</div>}
      {successMessage && <div className="banner banner-success">{successMessage}</div>}

      <SectionPanel title="ภาษาที่มีอยู่">
        <div className="editor-list">
          {languages.map((lang) => (
            <div className="editor-card" key={lang.code}>
              <div className="lang-row">
                <div className="lang-info">
                  <strong>{lang.name}</strong>
                  <code className="lang-code">{lang.code}</code>
                  {lang.isDefault && <span className="badge badge-default">Default</span>}
                  {!lang.isActive && <span className="badge badge-inactive">Inactive</span>}
                </div>
                <div className="lang-actions">
                  {!lang.isDefault && (
                    <button className="btn btn-secondary" onClick={() => handleSetDefault(lang.code)} type="button">
                      ตั้งเป็น Default
                    </button>
                  )}
                  <button className="btn btn-ghost" onClick={() => handleToggleActive(lang)} type="button">
                    {lang.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                  </button>
                  {!lang.isDefault && (
                    <button className="btn btn-ghost btn-danger" onClick={() => handleDelete(lang)} type="button">
                      ลบ
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionPanel>

      <SectionPanel title="เพิ่มภาษาใหม่">
        <div className="form-grid two-columns">
          <label>
            Language Code (เช่น en, zh, ja)
            <input
              placeholder="en"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />
          </label>
          <label>
            ชื่อภาษา
            <input
              placeholder="English"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </label>
          <label>
            คัดลอกเนื้อหาจากภาษา (ไม่บังคับ)
            <select value={copyFrom} onChange={(e) => setCopyFrom(e.target.value)}>
              <option value="">— เริ่มต้นเปล่า —</option>
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.code})
                </option>
              ))}
            </select>
          </label>
          <div className="form-actions">
            <button className="btn btn-primary" disabled={creating} onClick={handleCreate} type="button">
              {creating ? 'กำลังสร้าง...' : 'เพิ่มภาษา'}
            </button>
          </div>
        </div>
      </SectionPanel>
    </div>
  )
}
