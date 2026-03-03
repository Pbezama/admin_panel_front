'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

const TIPOS_COLUMNA = ['texto', 'numero', 'email', 'fecha', 'booleano']

export default function TablasCustomView() {
  const [tablas, setTablas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [tablaActiva, setTablaActiva] = useState(null)
  const [registros, setRegistros] = useState([])
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [cargandoRegistros, setCargandoRegistros] = useState(false)

  const [modalCrear, setModalCrear] = useState(false)
  const [modalEditar, setModalEditar] = useState(null)
  const [nuevaTabla, setNuevaTabla] = useState({ nombre: '', descripcion: '', columnas: [] })
  const [guardando, setGuardando] = useState(false)

  const [importFile, setImportFile] = useState(null)
  const [importPreview, setImportPreview] = useState(null)
  const [importando, setImportando] = useState(false)

  const POR_PAGINA = 50

  const cargarTablas = useCallback(async () => {
    setCargando(true)
    try {
      const r = await api.getTablasCustom()
      setTablas(r.tablas || [])
    } catch {
      setTablas([])
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargarTablas() }, [cargarTablas])

  const cargarRegistros = useCallback(async (tablaId, pag = 1) => {
    setCargandoRegistros(true)
    try {
      const r = await api.getRegistrosCustom(tablaId, { pagina: pag, por_pagina: POR_PAGINA })
      setRegistros(r.registros || [])
      setTotalRegistros(r.total || 0)
      setPagina(pag)
    } catch {
      setRegistros([])
    } finally {
      setCargandoRegistros(false)
    }
  }, [])

  const seleccionarTabla = (tabla) => {
    setTablaActiva(tabla)
    cargarRegistros(tabla.id, 1)
  }

  const crearTabla = async () => {
    if (!nuevaTabla.nombre.trim()) return
    setGuardando(true)
    try {
      const r = await api.crearTablaCustom({
        nombre: nuevaTabla.nombre.trim(),
        descripcion: nuevaTabla.descripcion,
        columnas: nuevaTabla.columnas
      })
      setTablas(prev => [r.tabla, ...prev])
      setModalCrear(false)
      setNuevaTabla({ nombre: '', descripcion: '', columnas: [] })
      setImportPreview(null)
    } catch (e) {
      alert('Error: ' + e.message)
    } finally {
      setGuardando(false)
    }
  }

  const editarTabla = async () => {
    if (!modalEditar) return
    setGuardando(true)
    try {
      const r = await api.actualizarTablaCustom(modalEditar.id, {
        nombre: modalEditar.nombre,
        descripcion: modalEditar.descripcion,
        columnas: modalEditar.columnas
      })
      setTablas(prev => prev.map(t => t.id === r.tabla.id ? { ...t, ...r.tabla } : t))
      if (tablaActiva?.id === modalEditar.id) setTablaActiva(prev => ({ ...prev, ...r.tabla }))
      setModalEditar(null)
    } catch (e) {
      alert('Error: ' + e.message)
    } finally {
      setGuardando(false)
    }
  }

  const eliminarTabla = async (tabla) => {
    if (!confirm(`¿Eliminar la tabla "${tabla.nombre}" y todos sus registros? Esta acción no se puede deshacer.`)) return
    try {
      await api.eliminarTablaCustom(tabla.id)
      setTablas(prev => prev.filter(t => t.id !== tabla.id))
      if (tablaActiva?.id === tabla.id) { setTablaActiva(null); setRegistros([]) }
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }

  const exportarCSV = () => {
    if (!tablaActiva || registros.length === 0) return
    const cols = tablaActiva.columnas?.map(c => c.nombre) || []
    if (cols.length === 0 && registros.length > 0) {
      // inferir columnas desde primer registro
      cols.push(...Object.keys(registros[0].datos || {}))
    }
    const lines = [
      ['id', 'creado_en', ...cols].join(','),
      ...registros.map(r => [
        r.id,
        r.creado_en?.slice(0, 19) || '',
        ...cols.map(c => {
          const v = r.datos?.[c] ?? ''
          return typeof v === 'string' && v.includes(',') ? `"${v}"` : v
        })
      ].join(','))
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tablaActiva.nombre}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = async (file) => {
    setImportFile(file)
    const fd = new FormData()
    fd.append('archivo', file)
    try {
      const res = await api.importarEsquemaCSV(fd)
      setImportPreview(res)
      setNuevaTabla(p => ({ ...p, columnas: res.columnas_detectadas || [] }))
    } catch (e) {
      alert('Error al analizar archivo: ' + e.message)
    }
  }

  const importarDatosEnTabla = async () => {
    if (!importFile || !tablaActiva) return
    setImportando(true)
    try {
      const fd = new FormData()
      fd.append('archivo', importFile)
      fd.append('tabla_id', tablaActiva.id)
      const res = await api.importarEsquemaCSV(fd)
      alert(`✓ ${res.insertados} registros importados`)
      setImportFile(null)
      cargarRegistros(tablaActiva.id, 1)
    } catch (e) {
      alert('Error al importar: ' + e.message)
    } finally {
      setImportando(false)
    }
  }

  const cols = tablaActiva?.columnas?.map(c => c.nombre) ||
    (registros.length > 0 ? Object.keys(registros[0].datos || {}) : [])

  return (
    <div style={{ display: 'flex', height: '100%', gap: 0, fontFamily: 'inherit' }}>
      {/* ── Panel izquierdo: lista de tablas ── */}
      <div style={{ width: 260, borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Mis Tablas</span>
          <button
            onClick={() => { setModalCrear(true); setNuevaTabla({ nombre: '', descripcion: '', columnas: [] }); setImportPreview(null) }}
            style={{ padding: '4px 10px', fontSize: 11, background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
          >+ Nueva</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {cargando ? (
            <div style={{ padding: 16, color: '#6b7280', fontSize: 12 }}>Cargando...</div>
          ) : tablas.length === 0 ? (
            <div style={{ padding: 16, color: '#9ca3af', fontSize: 12 }}>No hay tablas aún. Crea una o configura el nodo "Datos BD" en un flujo.</div>
          ) : tablas.map(t => (
            <div
              key={t.id}
              onClick={() => seleccionarTabla(t)}
              style={{
                padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6',
                background: tablaActiva?.id === t.id ? '#f0fdf4' : 'transparent',
                borderLeft: tablaActiva?.id === t.id ? '3px solid #10b981' : '3px solid transparent'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13 }}>{t.nombre}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{t.total_registros || 0} registros · {t.columnas?.length || 0} cols</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panel derecho: registros ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!tablaActiva ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: 14 }}>
            Selecciona una tabla para ver sus registros
          </div>
        ) : (
          <>
            {/* Header de tabla */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{tablaActiva.nombre}</span>
                {tablaActiva.descripcion && <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 8 }}>{tablaActiva.descripcion}</span>}
                <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>{totalRegistros} registros</span>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {/* Import CSV */}
                <label style={{ padding: '4px 8px', fontSize: 11, background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
                  📥 Importar
                  <input type="file" accept=".csv,.xlsx,.xls" hidden onChange={e => setImportFile(e.target.files?.[0] || null)} />
                </label>
                {importFile && (
                  <button
                    onClick={importarDatosEnTabla}
                    disabled={importando}
                    style={{ padding: '4px 8px', fontSize: 11, background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                  >{importando ? 'Importando...' : `Importar "${importFile.name}"`}</button>
                )}
                <button
                  onClick={exportarCSV}
                  disabled={registros.length === 0}
                  style={{ padding: '4px 8px', fontSize: 11, background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontWeight: 500, opacity: registros.length === 0 ? 0.4 : 1 }}
                >📤 Exportar CSV</button>
                <button
                  onClick={() => setModalEditar({ ...tablaActiva })}
                  style={{ padding: '4px 8px', fontSize: 11, background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}
                >✏️ Editar esquema</button>
                <button
                  onClick={() => eliminarTabla(tablaActiva)}
                  style={{ padding: '4px 8px', fontSize: 11, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', color: '#dc2626' }}
                >🗑 Eliminar</button>
              </div>
            </div>

            {/* Tabla de registros */}
            <div style={{ flex: 1, overflowAuto: 'auto', overflow: 'auto' }}>
              {cargandoRegistros ? (
                <div style={{ padding: 20, color: '#6b7280', fontSize: 12 }}>Cargando registros...</div>
              ) : registros.length === 0 ? (
                <div style={{ padding: 20, color: '#9ca3af', fontSize: 13 }}>No hay registros en esta tabla aún.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Creado</th>
                      {cols.map(c => <th key={c} style={thStyle}>{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {registros.map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={tdStyle}>{r.id}</td>
                        <td style={tdStyle}>{r.creado_en?.slice(0, 16).replace('T', ' ') || '-'}</td>
                        {cols.map(c => <td key={c} style={tdStyle}>{String(r.datos?.[c] ?? '-')}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Paginación */}
            {totalRegistros > POR_PAGINA && (
              <div style={{ padding: '8px 16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
                <button disabled={pagina === 1} onClick={() => cargarRegistros(tablaActiva.id, pagina - 1)} style={btnPage}>← Anterior</button>
                <span style={{ color: '#6b7280' }}>Página {pagina} de {Math.ceil(totalRegistros / POR_PAGINA)}</span>
                <button disabled={pagina * POR_PAGINA >= totalRegistros} onClick={() => cargarRegistros(tablaActiva.id, pagina + 1)} style={btnPage}>Siguiente →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal: crear tabla ── */}
      {modalCrear && (
        <ModalOverlay onClose={() => { setModalCrear(false); setImportPreview(null) }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>Nueva tabla</h3>

          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Nombre de la tabla</label>
            <input style={inputStyle} value={nuevaTabla.nombre} onChange={e => setNuevaTabla(p => ({ ...p, nombre: e.target.value }))} placeholder="ej: clientes_captados" />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Descripción (opcional)</label>
            <input style={inputStyle} value={nuevaTabla.descripcion} onChange={e => setNuevaTabla(p => ({ ...p, descripcion: e.target.value }))} placeholder="Para qué sirve esta tabla..." />
          </div>

          {/* Import para detectar columnas */}
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Importar esquema desde CSV/Excel</label>
            <input type="file" accept=".csv,.xlsx,.xls,.ods" onChange={e => e.target.files?.[0] && handleImportFile(e.target.files[0])} style={{ fontSize: 12 }} />
            {importPreview && (
              <div style={{ marginTop: 4, fontSize: 11, color: '#059669' }}>
                ✓ {importPreview.total_filas} filas · {importPreview.columnas_detectadas?.length} columnas detectadas
              </div>
            )}
          </div>

          {/* Columnas */}
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Columnas</label>
            {(nuevaTabla.columnas || []).map((col, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                <input
                  value={col.nombre} onChange={e => { const c = [...nuevaTabla.columnas]; c[i] = { ...c[i], nombre: e.target.value }; setNuevaTabla(p => ({ ...p, columnas: c })) }}
                  placeholder="nombre_columna" style={{ ...inputStyle, flex: 2, margin: 0 }}
                />
                <select
                  value={col.tipo} onChange={e => { const c = [...nuevaTabla.columnas]; c[i] = { ...c[i], tipo: e.target.value }; setNuevaTabla(p => ({ ...p, columnas: c })) }}
                  style={{ ...inputStyle, flex: 1, margin: 0 }}
                >
                  {TIPOS_COLUMNA.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => setNuevaTabla(p => ({ ...p, columnas: p.columnas.filter((_, j) => j !== i) }))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
              </div>
            ))}
            <button onClick={() => setNuevaTabla(p => ({ ...p, columnas: [...p.columnas, { nombre: '', tipo: 'texto', requerido: false }] }))} style={{ fontSize: 12, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 0' }}>+ Agregar columna</button>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
            <button onClick={() => { setModalCrear(false); setImportPreview(null) }} style={btnSecondary}>Cancelar</button>
            <button onClick={crearTabla} disabled={guardando || !nuevaTabla.nombre.trim()} style={{ ...btnPrimary, opacity: guardando || !nuevaTabla.nombre.trim() ? 0.5 : 1 }}>
              {guardando ? 'Creando...' : 'Crear tabla'}
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* ── Modal: editar esquema ── */}
      {modalEditar && (
        <ModalOverlay onClose={() => setModalEditar(null)}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>Editar esquema · {modalEditar.nombre}</h3>

          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Descripción</label>
            <input style={inputStyle} value={modalEditar.descripcion || ''} onChange={e => setModalEditar(p => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción de la tabla..." />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Columnas</label>
            {(modalEditar.columnas || []).map((col, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                <input
                  value={col.nombre} onChange={e => { const c = [...modalEditar.columnas]; c[i] = { ...c[i], nombre: e.target.value }; setModalEditar(p => ({ ...p, columnas: c })) }}
                  placeholder="nombre_columna" style={{ ...inputStyle, flex: 2, margin: 0 }}
                />
                <select
                  value={col.tipo} onChange={e => { const c = [...modalEditar.columnas]; c[i] = { ...c[i], tipo: e.target.value }; setModalEditar(p => ({ ...p, columnas: c })) }}
                  style={{ ...inputStyle, flex: 1, margin: 0 }}
                >
                  {TIPOS_COLUMNA.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => setModalEditar(p => ({ ...p, columnas: p.columnas.filter((_, j) => j !== i) }))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
              </div>
            ))}
            <button onClick={() => setModalEditar(p => ({ ...p, columnas: [...(p.columnas || []), { nombre: '', tipo: 'texto', requerido: false }] }))} style={{ fontSize: 12, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 0' }}>+ Agregar columna</button>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
            <button onClick={() => setModalEditar(null)} style={btnSecondary}>Cancelar</button>
            <button onClick={editarTabla} disabled={guardando} style={{ ...btnPrimary, opacity: guardando ? 0.5 : 1 }}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  )
}

function ModalOverlay({ children, onClose }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 12, padding: 24, width: '90%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

// Estilos inline reutilizables
const thStyle = { padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#374151', whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb' }
const tdStyle = { padding: '6px 12px', fontSize: 12, color: '#374151', borderRight: '1px solid #f3f4f6', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
const btnPage = { padding: '3px 10px', fontSize: 11, background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }
const inputStyle = { width: '100%', padding: '6px 10px', fontSize: 12, borderRadius: 6, border: '1px solid #d1d5db', boxSizing: 'border-box', marginBottom: 0 }
const btnPrimary = { padding: '7px 18px', fontSize: 12, background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }
const btnSecondary = { padding: '7px 18px', fontSize: 12, background: 'transparent', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer' }
