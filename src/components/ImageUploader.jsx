import { useState, useRef } from 'react'
import { uploadImage } from '../lib/supabase'

export default function ImageUploader({ onUpload, currentUrl }) {
  const [preview, setPreview] = useState(currentUrl || '')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    setProgress(50)
    try {
      const result = await uploadImage(file)
      setProgress(100)
      onUpload(result.url)
    } catch (err) {
      console.error('Upload failed:', err)
      setPreview('')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div>
      <div
        className={`upload-zone${dragging ? " dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
      >
        {preview ? (
          <div className="preview-container">
            <img src={preview} alt="preview" className="preview" />
            {!uploading && <button className="preview-remove" onClick={e => { e.stopPropagation(); setPreview(""); onUpload("") }}>×</button>}
          </div>
        ) : (
          <>
            <div className="icon">🖼️</div>
            <p>点击或拖拽上传项目图片</p>
          </>
        )}
        {uploading && <div className="upload-progress"><div className="bar" style={{width: progress + '%'}} /></div>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{display: "none"}} onChange={e => handleFile(e.target.files[0])} />
    </div>
  )
}