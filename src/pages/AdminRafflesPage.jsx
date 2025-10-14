import { useEffect, useState } from 'react'
import { rafflesService, getImageUrl } from '../services/rifasService.js'
import { useNotificationContext } from '../contexts/NotificationContext.jsx'

function AdminRafflesPage() {
  const [list, setList] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [total, setTotal] = useState(100)
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showSuccess, showError } = useNotificationContext()

  const refresh = async () => {
    try {
      setLoading(true)
      const raffles = await rafflesService.getActiveRaffles()
      setList(raffles || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('Imagem muito grande. Tamanho máximo: 5MB')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePriceChange = (e) => {
    let value = e.target.value
    value = value.replace(/[^\d,]/g, '')
    const parts = value.split(',')
    if (parts.length > 2) {
      value = parts[0] + ',' + parts.slice(1).join('')
    }
    setPrice(value)
  }

  const onCreate = async (e) => {
    e.preventDefault()
    
    if (!title || !description || !imageFile || total < 1 || !price) {
      showError('Preencha todos os campos obrigatórios')
      return
    }
    
    try {
      await rafflesService.addRaffle({ 
        title, 
        description,
        imageFile,
        total: Number(total), 
        price: price
      })
      showSuccess('Rifa criada com sucesso!')
      setTitle('')
      setDescription('')
      setImageFile(null)
      setImagePreview('')
      setTotal(100)
      setPrice('')
      await refresh()
    } catch (err) {
      showError('Erro ao criar rifa: ' + err.message)
    }
  }

  const onClose = async (id) => {
    try {
      await rafflesService.finishRaffle(id)
      showSuccess('Rifa encerrada com sucesso!')
      await refresh()
    } catch (err) {
      showError('Erro ao encerrar rifa: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <h2 className="page-title">Gerenciar rifas</h2>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Carregando rifas...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <h2 className="page-title">Gerenciar rifas</h2>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <div>Erro ao carregar rifas: {error}</div>
          <button onClick={refresh} style={{ marginTop: '1rem' }}>
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h2 className="page-title">Gerenciar rifas</h2>
      <form onSubmit={onCreate} className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-row">
              <label>Título *</label>
              <input className="input" placeholder="Ex: Skin AK-47" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="form-row">
              <label>Preço por número *</label>
              <input 
                className="input" 
                type="text" 
                inputMode="decimal"
                placeholder="Ex: 15,20" 
                value={price} 
                onChange={handlePriceChange} 
                required 
              />
            </div>
          </div>
          
          <div className="form-row">
            <label>Descrição *</label>
            <textarea 
              className="input" 
              placeholder="Descreva a rifa..." 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows={3}
              required
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-row">
              <label>Total de números *</label>
              <input className="input" type="number" min={1} placeholder="Ex: 100" value={total} onChange={e => setTotal(e.target.value)} required />
            </div>
            <div className="form-row">
              <label>Imagem *</label>
              <input 
                className="input" 
                type="file" 
                accept="image/jpeg,image/png,image/gif,image/webp" 
                onChange={handleImageChange}
                required={!imageFile}
                style={{ padding: '8px' }}
              />
            </div>
          </div>

          {imagePreview && (
            <div style={{ marginTop: 8 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>Preview:</label>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '200px', 
                  borderRadius: 8, 
                  border: '1px solid rgba(255,255,255,0.1)' 
                }} 
              />
            </div>
          )}

          <button className="btn" type="submit" style={{ marginTop: 8 }}>Criar rifa</button>
        </div>
      </form>

      <div className="grid">
        {list && list.length > 0 ? (
          list.map(r => (
            <div className="card raffle-card" key={r.id}>
              <img src={getImageUrl(r.imagem)} alt={r.titulo || 'Rifa'} />
              <div className="raffle-meta">
                <div>
                  <div style={{ fontWeight: 700 }}>{r.titulo || 'Sem título'}</div>
                  <div className="muted">
                    R$ {(r.preco || 0).toFixed(2)} • {r.cotasDisponiveis || 0}/{r.numCotas || 0}
                  </div>
                </div>
                <button className="btn" onClick={() => onClose(r.id)}>Encerrar</button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            Nenhuma rifa ativa encontrada
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminRafflesPage


