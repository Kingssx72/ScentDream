import { useState, useEffect } from 'react'

function App() {
  const [pestanaActiva, setPestanaActiva] = useState('Perfumería') 

  // === 1. MEMORIAS PERMANENTES (Se guardan en el disco duro) ===
  
  // Ingredientes
  const [ingredientes, setIngredientes] = useState(() => {
    const guardado = localStorage.getItem('mi_perfumeria_ingredientes')
    return guardado ? JSON.parse(guardado) : [
      { id: 1, nombre: 'Bergamota', nota: 'salida', color: 'bg-green-900/30 border-green-700 text-green-300' },
      { id: 2, nombre: 'Limón', nota: 'salida', color: 'bg-green-900/30 border-green-700 text-green-300' },
      { id: 3, nombre: 'Jazmín', nota: 'corazón', color: 'bg-pink-900/30 border-pink-700 text-pink-300' },
      { id: 4, nombre: 'Rosa', nota: 'corazón', color: 'bg-pink-900/30 border-pink-700 text-pink-300' },
      { id: 5, nombre: 'Vainilla', nota: 'fondo', color: 'bg-amber-900/30 border-amber-700 text-amber-300' },
      { id: 6, nombre: 'Sándalo', nota: 'fondo', color: 'bg-amber-900/30 border-amber-700 text-amber-300' },
    ]
  })
  useEffect(() => { localStorage.setItem('mi_perfumeria_ingredientes', JSON.stringify(ingredientes)) }, [ingredientes])

  // Maceraciones
  const [maceraciones, setMaceraciones] = useState(() => {
    const guardado = localStorage.getItem('mi_perfumeria_maceraciones')
    return guardado ? JSON.parse(guardado) : []
  })
  useEffect(() => { localStorage.setItem('mi_perfumeria_maceraciones', JSON.stringify(maceraciones)) }, [maceraciones])

  // Tickets
  const [tickets, setTickets] = useState(() => {
    const guardado = localStorage.getItem('mi_perfumeria_tickets')
    return guardado ? JSON.parse(guardado) : [
      { id: 1, titulo: 'Comprar frascos de cristal', estado: 'Pendiente', resaltado: true, fecha: '18/10/2026' }
    ]
  })
  useEffect(() => { localStorage.setItem('mi_perfumeria_tickets', JSON.stringify(tickets)) }, [tickets])

  // Archivos (Biblioteca)
  const [archivos, setArchivos] = useState(() => {
    const guardado = localStorage.getItem('mi_perfumeria_archivos')
    return guardado ? JSON.parse(guardado) : [
      { id: 1, nombre: 'Guía de Maceración.pdf', tipo: 'pdf', fecha: '15/10/2026', tamaño: '2.4 MB' }
    ]
  })
  useEffect(() => { localStorage.setItem('mi_perfumeria_archivos', JSON.stringify(archivos)) }, [archivos])

  // Fórmula actual en el frasco
  const [formula, setFormula] = useState(() => {
    const guardado = localStorage.getItem('mi_perfumeria_formula')
    return guardado ? JSON.parse(guardado) : []
  })
  useEffect(() => { localStorage.setItem('mi_perfumeria_formula', JSON.stringify(formula)) }, [formula])


  // === 2. LÓGICA DEL LABORATORIO ===
  const [modalIngrediente, setModalIngrediente] = useState(null) 
  const [cantidadTemporal, setCantidadTemporal] = useState('')
  const [unidadTemporal, setUnidadTemporal] = useState('%') 

  const [modalGuardar, setModalGuardar] = useState(false)
  const [nombrePerfume, setNombrePerfume] = useState('')
  const [diasMaceracion, setDiasMaceracion] = useState(30)
  const [textoNuevoTicket, setTextoNuevoTicket] = useState('')

  const iniciarArrastre = (e, ingrediente) => e.dataTransfer.setData('ingrediente_id', ingrediente.id)
  const permitirSoltar = (e) => e.preventDefault()

  const soltarIngrediente = (e, zona) => {
    e.preventDefault()
    const id = parseInt(e.dataTransfer.getData('ingrediente_id'))
    const ingredienteArrastrado = ingredientes.find(ing => ing.id === id)
    if (ingredienteArrastrado) {
      setCantidadTemporal('')
      setUnidadTemporal('%') 
      setModalIngrediente({ ingrediente: ingredienteArrastrado, zona: zona, modo: 'crear' })
    }
  }

  const abrirEdicion = (item) => {
    setCantidadTemporal(item.cantidad.toString())
    setUnidadTemporal(item.unidad || '%')
    setModalIngrediente({ ingrediente: item, zona: item.zonaAsignada, modo: 'editar', idUnico: item.idUnico })
  }

  const confirmarCantidad = (e) => {
    e.preventDefault()
    if (!cantidadTemporal || isNaN(cantidadTemporal)) return
    if (modalIngrediente.modo === 'crear') {
      const nuevoElemento = { idUnico: Date.now(), ...modalIngrediente.ingrediente, zonaAsignada: modalIngrediente.zona, cantidad: parseFloat(cantidadTemporal), unidad: unidadTemporal }
      setFormula([...formula, nuevoElemento])
    } else {
      setFormula(formula.map(item => item.idUnico === modalIngrediente.idUnico ? { ...item, cantidad: parseFloat(cantidadTemporal), unidad: unidadTemporal } : item))
    }
    setModalIngrediente(null)
  }

  const eliminarDelFrasco = () => {
    setFormula(formula.filter(item => item.idUnico !== modalIngrediente.idUnico))
    setModalIngrediente(null)
  }

  const guardarFormulaFinal = (e) => {
    e.preventDefault()
    if (!nombrePerfume.trim()) return

    const nuevoPerfume = { id: Date.now(), nombre: nombrePerfume, fechaInicio: new Date().toLocaleDateString('es-ES'), diasTotales: parseInt(diasMaceracion), diasTranscurridos: 0 }
    setMaceraciones([nuevoPerfume, ...maceraciones])
    setFormula([]) 
    setModalGuardar(false)
    setNombrePerfume('')
    setPestanaActiva('Menu') 
  }

  const totalPorcentaje = formula.filter(i => i.unidad === '%').reduce((acc, i) => acc + i.cantidad, 0);
  const totalMl = formula.filter(i => i.unidad === 'ml').reduce((acc, i) => acc + i.cantidad, 0);
  const totalGotas = formula.filter(i => i.unidad === 'gotas').reduce((acc, i) => acc + i.cantidad, 0);
  const totalGramos = formula.filter(i => i.unidad === 'g').reduce((acc, i) => acc + i.cantidad, 0);
  const totalMg = formula.filter(i => i.unidad === 'mg').reduce((acc, i) => acc + i.cantidad, 0);

  // === 3. LÓGICA DE TICKETS Y BIBLIOTECA ===
  const crearTicket = (e) => { 
    e.preventDefault(); 
    if (textoNuevoTicket.trim() === '') return; 
    setTickets([...tickets, { id: Date.now(), titulo: textoNuevoTicket, estado: 'Pendiente', resaltado: false, fecha: new Date().toLocaleDateString('es-ES') }]); 
    setTextoNuevoTicket(''); 
  }
  const eliminarTicket = (id) => setTickets(tickets.filter(t => t.id !== id));
  const cambiarEstado = (id, nuevoEstado) => setTickets(tickets.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t));
  const alternarResaltado = (id) => setTickets(tickets.map(t => t.id === id ? { ...t, resaltado: !t.resaltado } : t));

  const simularSubidaArchivo = () => {
    const nuevoArchivo = { id: Date.now(), nombre: 'Nueva Fórmula.docx', tipo: 'doc', fecha: new Date().toLocaleDateString('es-ES'), tamaño: '320 KB' };
    setArchivos([nuevoArchivo, ...archivos]);
  }
  const eliminarArchivo = (id) => setArchivos(archivos.filter(a => a.id !== id));

  return (
    <div className="min-h-screen bg-slate-950 p-8 font-sans relative text-slate-200 overflow-hidden">
      
      {/* FONDO ANIMADO */}
      <style>
        {`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(60px, -60px) scale(1.1); }
            66% { transform: translate(-40px, 40px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 12s infinite alternate ease-in-out; }
          .animation-delay-2000 { animation-delay: 3s; }
          .animation-delay-4000 { animation-delay: 6s; }
        `}
      </style>

      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-blob z-0 pointer-events-none"></div>
      <div className="absolute top-40 right-20 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000 z-0 pointer-events-none"></div>
      <div className="absolute -bottom-20 left-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000 z-0 pointer-events-none"></div>

      {/* MENÚ SUPERIOR */}
      <nav className="flex gap-2 mb-8 relative z-10 bg-slate-900/60 backdrop-blur-xl p-2 rounded-2xl shadow-xl w-max mx-auto border border-slate-700/50">
        {['Menu', 'Perfumería', 'Tickets', 'Biblioteca'].map((pestana) => (
          <button 
            key={pestana}
            onClick={() => setPestanaActiva(pestana)}
            className={`px-8 py-2.5 rounded-xl transition-all font-medium text-sm tracking-wide ${
              pestanaActiva === pestana 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                : 'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {pestana}
          </button>
        ))}
      </nav>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="bg-slate-800/80 backdrop-blur-2xl rounded-[2.5rem] p-8 h-[780px] flex gap-8 relative z-10 shadow-2xl border border-slate-600/50">
        
        {/* === VISTA 1: PERFUMERÍA === */}
        {pestanaActiva === 'Perfumería' && (
           <div className="w-full h-full flex gap-8">
            <aside className="w-72 border border-slate-700 rounded-3xl p-6 flex flex-col shadow-inner bg-slate-900/40 overflow-y-auto">
              <h2 className="font-bold text-white mb-2 text-lg">Catálogo</h2>
              <p className="text-[10px] text-slate-500 mb-6 uppercase tracking-widest font-bold">Arrastra al frasco</p>
              <div className="w-full flex flex-col gap-3">
                {ingredientes.map((ingrediente) => (
                  <div key={ingrediente.id} draggable onDragStart={(e) => iniciarArrastre(e, ingrediente)} className={`p-3.5 rounded-2xl border text-sm font-medium cursor-grab active:cursor-grabbing hover:shadow-lg hover:-translate-y-0.5 hover:brightness-125 transition-all flex items-center gap-3 ${ingrediente.color}`}>
                    <span className="text-lg bg-slate-900/50 w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                      {ingrediente.nota === 'salida' ? '🌿' : ingrediente.nota === 'corazón' ? '🌸' : '🪵'}
                    </span>
                    {ingrediente.nombre}
                  </div>
                ))}
              </div>
            </aside>

            <section className="flex-1 flex flex-col justify-end items-center pb-8 relative">
              <div className="flex flex-col items-center relative z-10">
                <div className="absolute top-[30px] w-1.5 h-[340px] bg-white/40 rounded-full z-0 shadow-sm"></div>
                <div className="w-24 h-12 rounded-t-2xl bg-gradient-to-b from-slate-300 to-slate-500 shadow-inner z-10 border border-slate-400"></div>
                <div className="w-16 h-5 bg-slate-400 z-10 border-x border-slate-500"></div>
                
                <div onDragOver={permitirSoltar} onDrop={(e) => soltarIngrediente(e, 'salida')} className="w-[220px] h-[130px] flex flex-col pt-3 items-center hover:bg-green-400/20 transition-all cursor-pointer relative group rounded-t-[3.5rem] bg-white/20 backdrop-blur-md shadow-[0_4px_30px_rgba(255,255,255,0.05)] border border-white/40 z-10 overflow-hidden">
                  <span className="font-bold text-slate-100 drop-shadow-md group-hover:text-green-300 uppercase tracking-widest text-xs mb-2 transition-colors">Salida</span>
                  <div className="flex gap-2 flex-wrap justify-center px-4">
                    {formula.filter(i => i.zonaAsignada === 'salida').map(item => (
                       <span key={item.idUnico} onClick={(e) => { e.stopPropagation(); abrirEdicion(item); }} className="inline-flex items-center text-xs px-3 py-1.5 rounded-full border shadow-sm cursor-pointer hover:shadow-md hover:ring-1 hover:ring-white transition-all whitespace-nowrap bg-slate-800/90 border-slate-500 text-white">
                         {item.nombre} <b className="ml-2 text-amber-300 opacity-90">{item.cantidad}{item.unidad}</b>
                       </span>
                    ))}
                  </div>
                </div>
                
                <div onDragOver={permitirSoltar} onDrop={(e) => soltarIngrediente(e, 'corazón')} className="w-[320px] h-[160px] flex flex-col pt-3 items-center hover:bg-pink-400/20 transition-all cursor-pointer relative group rounded-t-[3rem] bg-white/20 backdrop-blur-md shadow-[0_4px_30px_rgba(255,255,255,0.05)] border border-white/40 border-t-0 z-10 overflow-hidden">
                  <span className="font-bold text-slate-100 drop-shadow-md group-hover:text-pink-300 uppercase tracking-widest text-xs mb-2 transition-colors">Corazón</span>
                  <div className="flex gap-2 flex-wrap justify-center px-6">
                    {formula.filter(i => i.zonaAsignada === 'corazón').map(item => (
                       <span key={item.idUnico} onClick={(e) => { e.stopPropagation(); abrirEdicion(item); }} className="inline-flex items-center text-xs px-3 py-1.5 rounded-full border shadow-sm cursor-pointer hover:shadow-md hover:ring-1 hover:ring-white transition-all whitespace-nowrap bg-slate-800/90 border-slate-500 text-white">
                         {item.nombre} <b className="ml-2 text-amber-300 opacity-90">{item.cantidad}{item.unidad}</b>
                       </span>
                    ))}
                  </div>
                </div>
                
                <div onDragOver={permitirSoltar} onDrop={(e) => soltarIngrediente(e, 'fondo')} className="w-[420px] h-[180px] rounded-b-[4.5rem] flex flex-col pt-3 items-center hover:bg-amber-400/20 transition-all cursor-pointer relative group bg-white/20 backdrop-blur-md shadow-[0_15px_40px_rgba(255,255,255,0.05)] border border-white/40 border-t-0 z-10 overflow-hidden">
                  <span className="font-bold text-slate-100 drop-shadow-md group-hover:text-amber-300 uppercase tracking-widest text-xs mb-2 transition-colors">Fondo</span>
                  <div className="flex gap-2 flex-wrap justify-center px-10">
                    {formula.filter(i => i.zonaAsignada === 'fondo').map(item => (
                       <span key={item.idUnico} onClick={(e) => { e.stopPropagation(); abrirEdicion(item); }} className="inline-flex items-center text-sm px-3 py-1.5 rounded-full border shadow-sm cursor-pointer hover:shadow-md hover:ring-1 hover:ring-white transition-all whitespace-nowrap bg-slate-800/90 border-slate-500 text-white">
                         {item.nombre} <b className="ml-2 text-amber-300 opacity-90">{item.cantidad}{item.unidad}</b>
                       </span>
                    ))}
                  </div>
                </div>
                
                <div className="w-[360px] h-10 bg-black/50 rounded-[100%] blur-xl absolute -bottom-4 z-0 pointer-events-none"></div>
              </div>
            </section>

            <aside className="w-72 border border-slate-700 rounded-3xl p-6 flex flex-col shadow-inner bg-slate-900/40">
              <h2 className="font-bold text-white mb-2 text-lg">Análisis de Mezcla</h2>
              <p className="text-[10px] text-slate-500 mb-6 uppercase tracking-widest font-bold">Tiempo Real</p>
              
              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-600/50 shadow-sm">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Concentración</span>
                    <span className={`text-lg font-black ${totalPorcentaje > 100 ? 'text-red-400' : 'text-white'}`}>{totalPorcentaje}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700">
                    <div className={`h-full rounded-full transition-all duration-500 ${totalPorcentaje > 100 ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} style={{ width: `${Math.min(totalPorcentaje, 100)}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-600/50 shadow-sm flex flex-col items-center"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Volumen</span><span className="text-xl font-black text-white">{totalMl} <span className="text-xs text-slate-400">ml</span></span></div>
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-600/50 shadow-sm flex flex-col items-center"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Gotas</span><span className="text-xl font-black text-white">{totalGotas}</span></div>
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-600/50 shadow-sm flex flex-col items-center"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Peso (g)</span><span className="text-xl font-black text-white">{totalGramos} <span className="text-xs text-slate-400">g</span></span></div>
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-600/50 shadow-sm flex flex-col items-center"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Peso (mg)</span><span className="text-xl font-black text-white">{totalMg} <span className="text-xs text-slate-400">mg</span></span></div>
                </div>
              </div>

              <div className="mt-6">
                <button onClick={() => setModalGuardar(true)} disabled={formula.length === 0} className={`w-full py-4 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${formula.length > 0 && totalPorcentaje <= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-[1.02]' : formula.length > 0 && totalPorcentaje > 100 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'}`}>
                  <span className="text-xl">💾</span> Guardar Fórmula
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* === VISTA 2: MENU (PANEL DE CONTROL) === */}
        {pestanaActiva === 'Menu' && (
          <div className="w-full h-full flex flex-col gap-8 overflow-y-auto pr-4">
            <div><h2 className="text-3xl font-black text-white">Resumen</h2><p className="text-slate-400 mt-1">Panel de control de tu laboratorio.</p></div>
            <div className="bg-slate-900/50 rounded-3xl p-8 border border-slate-700 shadow-xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-6"><span className="bg-amber-900/50 text-amber-400 p-2 rounded-xl text-lg border border-amber-700/50">⏳</span> En Maceración</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {maceraciones.map(mac => {
                  const porcentaje = (mac.diasTranscurridos / mac.diasTotales) * 100;
                  const diasRestantes = mac.diasTotales - mac.diasTranscurridos;
                  return (
                    <div key={mac.id} className="border border-slate-700 rounded-2xl p-6 bg-slate-800/80 relative group hover:border-amber-500/50 transition-colors">
                      <div className="flex justify-between items-start mb-6">
                        <div><p className="font-bold text-lg text-white leading-tight">{mac.nombre}</p><p className="text-xs text-slate-400 font-medium mt-1">Desde el {mac.fechaInicio}</p></div>
                        <div className="text-right bg-slate-900 px-3 py-2 rounded-xl border border-slate-700"><p className="font-black text-2xl text-amber-400 leading-none">{diasRestantes}</p><p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Días más</p></div>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-700"><div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]" style={{ width: `${porcentaje}%` }}></div></div>
                    </div>
                  )
                })}
                {maceraciones.length === 0 && <p className="text-slate-500 text-sm">No tienes perfumes macerando.</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-slate-700 rounded-3xl p-6 bg-slate-900/50 shadow-sm flex items-center gap-4"><div className="w-14 h-14 bg-blue-900/50 text-blue-400 rounded-2xl flex items-center justify-center text-2xl border border-blue-700/50">📝</div><div><h3 className="font-bold text-slate-400 text-sm">Tickets</h3><p className="text-3xl font-black text-white">{tickets.length}</p></div></div>
              <div className="border border-slate-700 rounded-3xl p-6 bg-slate-900/50 shadow-sm flex items-center gap-4"><div className="w-14 h-14 bg-purple-900/50 text-purple-400 rounded-2xl flex items-center justify-center text-2xl border border-purple-700/50">📚</div><div><h3 className="font-bold text-slate-400 text-sm">Archivos</h3><p className="text-3xl font-black text-white">{archivos.length}</p></div></div>
              <div className="border border-slate-700 rounded-3xl p-6 bg-slate-900/50 shadow-sm flex items-center gap-4"><div className="w-14 h-14 bg-green-900/50 text-green-400 rounded-2xl flex items-center justify-center text-2xl border border-green-700/50">🧪</div><div><h3 className="font-bold text-slate-400 text-sm">Ingredientes</h3><p className="text-3xl font-black text-white">{ingredientes.length}</p></div></div>
            </div>
          </div>
        )}

        {/* === VISTA 3: TICKETS === */}
        {pestanaActiva === 'Tickets' && (
          <div className="w-full h-full flex flex-col gap-6">
            <form onSubmit={crearTicket} className="flex gap-4">
              <input type="text" value={textoNuevoTicket} onChange={(e) => setTextoNuevoTicket(e.target.value)} placeholder="Escribe una nueva idea y pulsa enter..." className="flex-1 px-6 py-4 bg-slate-900/60 border border-slate-700 rounded-2xl outline-none focus:border-indigo-500 text-lg text-white placeholder-slate-500 transition-all shadow-inner" />
              <button type="submit" className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl hover:scale-[1.02] shadow-lg transition-transform">+ Crear</button>
            </form>
            <div className="flex flex-1 gap-6 overflow-hidden">
              {['Pendiente', 'En Proceso', 'Completado'].map(nombreColumna => (
                <div key={nombreColumna} className="flex-1 bg-slate-900/40 border border-slate-700 rounded-3xl p-5 flex flex-col gap-4 overflow-y-auto shadow-inner">
                  <h3 className="font-bold text-center text-slate-400 uppercase tracking-widest text-xs">{nombreColumna}</h3>
                  {tickets.filter(t => t.estado === nombreColumna).map(ticket => (
                    <div key={ticket.id} className={`p-5 rounded-2xl border shadow-sm relative group transition-all ${ticket.resaltado ? 'border-amber-500/50 bg-amber-900/20' : 'border-slate-600 bg-slate-800 hover:border-slate-500'}`}>
                      <button onClick={() => alternarResaltado(ticket.id)} className="absolute top-4 right-4 text-xl opacity-30 hover:opacity-100 transition-opacity">{ticket.resaltado ? '⭐' : '☆'}</button>
                      <p className="text-xs text-slate-400 mb-3 font-medium">{ticket.fecha}</p>
                      <p className="font-bold mb-6 pr-6 leading-snug text-white">{ticket.titulo}</p>
                      <div className="flex justify-between items-center mt-auto border-t border-slate-700 pt-4">
                        <select value={ticket.estado} onChange={(e) => cambiarEstado(ticket.id, e.target.value)} className="text-xs font-bold bg-slate-900 text-slate-300 border border-slate-700 rounded-xl px-3 py-2 outline-none cursor-pointer">
                          <option value="Pendiente">Pendiente</option><option value="En Proceso">En Proceso</option><option value="Completado">Completado</option>
                        </select>
                        <button onClick={() => eliminarTicket(ticket.id)} className="text-red-400 hover:bg-red-900/30 border border-transparent hover:border-red-800/50 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === VISTA 4: BIBLIOTECA === */}
        {pestanaActiva === 'Biblioteca' && (
          <div className="w-full h-full flex flex-col gap-6 overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
              <div>
                <h2 className="text-3xl font-black text-white">Tus Documentos</h2>
                <p className="text-slate-400 mt-1">Guarda PDFs, imágenes o notas para tus perfumes.</p>
              </div>
              <button onClick={simularSubidaArchivo} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform">+ Subir Archivo</button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archivos.map(archivo => (
                  <div key={archivo.id} className="border border-slate-700 rounded-2xl p-4 flex flex-col hover:border-slate-500 hover:shadow-lg transition-all group bg-slate-800/80 relative">
                    <button onClick={() => eliminarArchivo(archivo.id)} className="absolute top-3 right-3 text-red-400 hover:bg-red-900/30 border border-transparent hover:border-red-800/50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 z-10 transition-all">🗑️</button>
                    <div className="flex justify-center items-center h-28 bg-slate-900/50 rounded-xl mb-4 text-5xl group-hover:scale-105 transition-transform border border-slate-700/50">
                      {archivo.tipo === 'pdf' ? '📕' : archivo.tipo === 'img' ? '🖼️' : '📄'}
                    </div>
                    <h3 className="font-bold text-white truncate text-lg" title={archivo.nombre}>{archivo.nombre}</h3>
                    <div className="flex justify-between text-xs font-mono text-slate-400 mt-2 mb-4"><span>{archivo.fecha}</span><span>{archivo.tamaño}</span></div>
                    <button className="mt-auto w-full py-2.5 bg-slate-700 border border-slate-600 font-bold text-sm rounded-lg group-hover:bg-slate-600 text-white transition-colors">Descargar</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* === MODALES (Añadir/Editar y Guardar) === */}
      {modalIngrediente && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-slate-800 rounded-[2rem] p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-600 animate-bounce-in flex flex-col">
            <h3 className="text-2xl font-black text-white mb-2">{modalIngrediente.modo === 'crear' ? 'Añadir' : 'Modificar'}</h3>
            <form onSubmit={confirmarCantidad} className="flex flex-col gap-4 mt-6 w-full">
              <div className="flex items-center gap-3 w-full">
                <input type="number" autoFocus value={cantidadTemporal} onChange={(e) => setCantidadTemporal(e.target.value)} className="flex-1 min-w-0 px-4 py-4 bg-slate-900 border border-slate-700 rounded-2xl outline-none focus:border-indigo-500 text-2xl text-center font-black text-white placeholder-slate-600" placeholder="0" min="0.01" step="0.01"/>
                <select value={unidadTemporal} onChange={(e) => setUnidadTemporal(e.target.value)} className="w-[100px] sm:w-32 px-3 sm:px-4 py-4 rounded-2xl bg-slate-900 border border-slate-700 outline-none focus:border-indigo-500 text-lg sm:text-xl font-bold cursor-pointer text-slate-300">
                  <option value="%">%</option><option value="ml">ml</option><option value="mg">mg</option><option value="g">g</option><option value="gotas">gotas</option>
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                {modalIngrediente.modo === 'editar' && (<button type="button" onClick={eliminarDelFrasco} className="px-5 py-4 bg-red-900/30 text-red-400 border border-red-800/50 rounded-2xl hover:bg-red-900/60 transition-colors">🗑️</button>)}
                <button type="button" onClick={() => setModalIngrediente(null)} className="flex-1 py-4 bg-slate-700 font-bold text-slate-300 rounded-2xl hover:bg-slate-600 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl hover:scale-[1.02] transition-transform">{modalIngrediente.modo === 'crear' ? 'Añadir' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalGuardar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-slate-800 rounded-[2rem] p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-600 animate-bounce-in">
            <h3 className="text-2xl font-black text-white mb-2">💾 Guardar Fórmula</h3>
            <form onSubmit={guardarFormulaFinal} className="flex flex-col gap-5 mt-6 w-full">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Nombre del Perfume</label>
                <input type="text" autoFocus required value={nombrePerfume} onChange={(e) => setNombrePerfume(e.target.value)} className="w-full px-5 py-4 bg-slate-900 border border-slate-700 rounded-2xl outline-none focus:border-indigo-500 text-lg font-bold text-white placeholder-slate-600" placeholder="Ej: Ensayo Floral nº3"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Días de Maceración</label>
                <div className="flex items-center gap-3">
                  <input type="number" required value={diasMaceracion} onChange={(e) => setDiasMaceracion(e.target.value)} className="flex-1 min-w-0 px-5 py-4 bg-slate-900 border border-slate-700 rounded-2xl outline-none focus:border-indigo-500 text-xl font-black text-white text-center" min="1"/>
                  <span className="text-slate-500 font-bold px-4">DÍAS</span>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setModalGuardar(false)} className="flex-1 py-4 bg-slate-700 font-bold text-slate-300 rounded-2xl hover:bg-slate-600 transition-colors">Volver</button>
                <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl hover:scale-[1.02] shadow-lg transition-transform">A Macerar ⏳</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default App