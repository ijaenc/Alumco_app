import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Mail, Send, Paperclip, 
  Trash2, Plus, Inbox, Send as SendIcon, 
  User, FileText, X, Check 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

// --- MENSAJES DE PRUEBA ---
const mensajesIniciales = [
  { id: 1, remitente: 'María González', asunto: 'Duda sobre Módulo 2', fecha: '10:30 AM', mensaje: 'Hola Profe, no me queda claro el concepto de derechos humanos universales...', leido: false },
  { id: 2, remitente: 'Juan Pérez', asunto: 'Entrega de Trabajo', fecha: 'Ayer', mensaje: 'Le adjunto mi trabajo de la semana 3. Saludos.', leido: true },
];

export default function TeacherMessages() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mensajes, setMensajes] = useState(mensajesIniciales);
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState<any>(mensajes[0]);
  const [escribiendo, setEscribiendo] = useState(false);
  
  // Estado para el nuevo mensaje
  const [nuevoMensaje, setNuevoMensaje] = useState({ para: '', asunto: '', cuerpo: '' });
  const [archivosAdjuntos, setArchivosAdjuntos] = useState<File[]>([]);

  const handleEnviar = () => {
    if (!nuevoMensaje.para || !nuevoMensaje.cuerpo) {
      toast.error("Por favor completa el destinatario y el mensaje");
      return;
    }
    toast.success("Mensaje enviado exitosamente a " + nuevoMensaje.para);
    setEscribiendo(false);
    setNuevoMensaje({ para: '', asunto: '', cuerpo: '' });
    setArchivosAdjuntos([]);
  };

  const agregarAdjunto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivosAdjuntos([...archivosAdjuntos, ...Array.from(e.target.files)]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-slate-800">Mensajería Alumco</h1>
        </div>
        <Button onClick={() => setEscribiendo(true)} className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Redactar Nuevo
        </Button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar: Lista de Mensajes */}
        <div className="w-full md:w-80 bg-white border-r border-gray-100 flex flex-col">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar mensajes..." className="pl-10 bg-gray-50 border-none rounded-xl" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {mensajes.map(m => (
              <div 
                key={m.id} 
                onClick={() => setMensajeSeleccionado(m)}
                className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${mensajeSeleccionado?.id === m.id ? 'bg-orange-50 border-r-4 border-r-orange-500' : 'hover:bg-gray-50'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-bold ${m.leido ? 'text-slate-600' : 'text-slate-900'}`}>{m.remitente}</span>
                  <span className="text-[10px] text-gray-400">{m.fecha}</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 truncate">{m.asunto}</p>
                <p className="text-xs text-gray-400 truncate mt-1">{m.mensaje}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Área de Lectura / Escritura */}
        <div className="hidden md:flex flex-1 bg-gray-50 flex-col">
          {escribiendo ? (
            /* VISTA REDACTAR */
            <div className="m-6 bg-white rounded-3xl border border-gray-100 shadow-xl flex flex-col flex-1 animate-in slide-in-from-bottom-4">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-800 text-white rounded-t-3xl">
                <span className="font-bold">Mensaje Nuevo</span>
                <button onClick={() => setEscribiendo(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                <Input 
                  placeholder="Para: (Nombre del alumno o sede)" 
                  value={nuevoMensaje.para}
                  onChange={e => setNuevoMensaje({...nuevoMensaje, para: e.target.value})}
                  className="border-0 border-b rounded-none px-0 focus-visible:ring-0 text-sm font-medium" 
                />
                <Input 
                  placeholder="Asunto" 
                  value={nuevoMensaje.asunto}
                  onChange={e => setNuevoMensaje({...nuevoMensaje, asunto: e.target.value})}
                  className="border-0 border-b rounded-none px-0 focus-visible:ring-0 text-sm font-medium" 
                />
                <textarea 
                  placeholder="Escribe tu mensaje aquí..." 
                  value={nuevoMensaje.cuerpo}
                  onChange={e => setNuevoMensaje({...nuevoMensaje, cuerpo: e.target.value})}
                  className="w-full h-64 p-0 border-none focus:outline-none text-sm resize-none"
                />

                {/* Lista de archivos adjuntos */}
                <div className="flex flex-wrap gap-2">
                  {archivosAdjuntos.map((file, i) => (
                    <div key={i} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border border-blue-100">
                      <FileText className="w-3 h-3" /> {file.name}
                      <button onClick={() => setArchivosAdjuntos(archivosAdjuntos.filter((_, idx) => idx !== i))}><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input type="file" multiple className="hidden" ref={fileInputRef} onChange={agregarAdjunto} />
                  <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:bg-gray-100">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </div>
                <Button onClick={handleEnviar} className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-bold">
                  Enviar Mensaje <SendIcon className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : mensajeSeleccionado ? (
            /* VISTA LEER MENSAJE */
            <div className="m-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col flex-1 animate-in fade-in">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{mensajeSeleccionado.asunto}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><User className="w-4 h-4" /></div>
                    <span className="text-sm font-bold text-slate-700">{mensajeSeleccionado.remitente}</span>
                    <span className="text-xs text-gray-400">({mensajeSeleccionado.fecha})</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></Button>
                </div>
              </div>
              <div className="p-8 text-slate-700 text-sm leading-relaxed flex-1">
                {mensajeSeleccionado.mensaje}
              </div>
              <div className="p-6 border-t border-gray-50">
                <Button variant="outline" className="rounded-xl border-gray-200 text-gray-500" onClick={() => {
                  setNuevoMensaje({ para: mensajeSeleccionado.remitente, asunto: 'Re: ' + mensajeSeleccionado.asunto, cuerpo: '' });
                  setEscribiendo(true);
                }}>
                  Responder Mensaje
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Mail className="w-16 h-16 mb-4 opacity-20" />
              <p>Selecciona un mensaje para leerlo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}