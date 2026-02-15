/**
 * Auto-layout para flujos generados por IA
 *
 * Posiciona nodos automaticamente usando BFS por niveles.
 * La IA genera nodos sin posiciones; esta funcion calcula {x, y} para cada uno.
 */

const VERTICAL_GAP = 160
const HORIZONTAL_GAP = 280

/**
 * Calcula posiciones para nodos de un flujo
 * @param {Array} nodos - Nodos de la IA (sin posicion)
 * @param {Array} edges - Edges de la IA
 * @param {Object|null} nodoInicio - Nodo inicio existente { id, posicion: {x, y} }
 * @returns {Array} Nodos con posicion calculada
 */
export function autoLayoutNodes(nodos, edges, nodoInicio) {
  if (!nodos || nodos.length === 0) return []

  const inicioId = nodoInicio?.id || 'node_inicio'
  const inicioX = nodoInicio?.posicion?.x || 250
  const inicioY = nodoInicio?.posicion?.y || 50

  // 1. Construir grafo de adyacencia
  const children = {}
  const allIds = new Set(nodos.map(n => n.id))

  allIds.forEach(id => { children[id] = [] })

  // Incluir edges que salen de node_inicio hacia nodos generados
  edges.forEach(e => {
    if (e.origen === inicioId && allIds.has(e.destino)) {
      if (!children[e.origen]) children[e.origen] = []
      children[e.origen].push(e.destino)
    }
    if (allIds.has(e.origen) && allIds.has(e.destino)) {
      children[e.origen].push(e.destino)
    }
  })

  // 2. BFS para calcular niveles (profundidad desde el primer nodo conectado a inicio)
  const levels = {}
  const visited = new Set()
  const queue = []

  // Encontrar nodos conectados directamente desde inicio
  const primerNivel = (children[inicioId] || []).filter(id => allIds.has(id))

  if (primerNivel.length > 0) {
    primerNivel.forEach(id => {
      levels[id] = 1
      visited.add(id)
      queue.push(id)
    })
  } else if (nodos.length > 0) {
    // Fallback: usar el primer nodo como nivel 1
    levels[nodos[0].id] = 1
    visited.add(nodos[0].id)
    queue.push(nodos[0].id)
  }

  while (queue.length > 0) {
    const current = queue.shift()
    const currentLevel = levels[current]

    for (const childId of (children[current] || [])) {
      if (!visited.has(childId)) {
        levels[childId] = currentLevel + 1
        visited.add(childId)
        queue.push(childId)
      } else if (levels[childId] < currentLevel + 1) {
        // Nodo convergente: usar el nivel mas profundo
        levels[childId] = currentLevel + 1
      }
    }
  }

  // Nodos no visitados (desconectados): colocar al final
  nodos.forEach(n => {
    if (!visited.has(n.id)) {
      const maxLevel = Math.max(1, ...Object.values(levels))
      levels[n.id] = maxLevel + 1
    }
  })

  // 3. Agrupar nodos por nivel
  const levelGroups = {}
  Object.entries(levels).forEach(([nodeId, level]) => {
    if (!levelGroups[level]) levelGroups[level] = []
    levelGroups[level].push(nodeId)
  })

  // 4. Calcular posiciones
  const positions = {}

  Object.entries(levelGroups).forEach(([level, nodeIds]) => {
    const levelNum = parseInt(level)
    const y = inicioY + (levelNum * VERTICAL_GAP)
    const totalWidth = (nodeIds.length - 1) * HORIZONTAL_GAP
    const startX = inicioX - (totalWidth / 2)

    nodeIds.forEach((nodeId, index) => {
      positions[nodeId] = {
        x: startX + (index * HORIZONTAL_GAP),
        y
      }
    })
  })

  // 5. Retornar nodos con posicion
  return nodos.map(n => ({
    ...n,
    posicion: positions[n.id] || { x: inicioX, y: inicioY + VERTICAL_GAP }
  }))
}
