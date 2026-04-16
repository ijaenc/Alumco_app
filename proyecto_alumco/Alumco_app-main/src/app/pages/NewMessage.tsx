import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Paperclip, Send, X, FileText } from "lucide-react";
import { Button } from "../components/ui/button";

const NewMessage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para el correo
  const [destinatario, setDestinatario] = useState('');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [archivoAdjunto, setArchivoAdjunto] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivoAdjunto(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Header estilo Correo */}
      <header className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
        <div className="flex items-center gap-4">
          {/* CAMBIO DE SEGURIDAD: Aquí le decimos que vuelva específicamente a la mensajería del admin */}
          <Link to="/admin/messages" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Nuevo Correo</h1>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 gap-2"
          onClick={() => {
            alert('Enviando mensaje con archivos...');
            navigate("/admin/messages"); // Te devuelve al panel de mensajes
          }}
        >
          <Send className="w-4 h-4" />
          Enviar
        </Button>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-4">
        {/* Campo: Para */}
        <div className="flex items-center border-b border-gray-100 py-4">
          <span className="text-gray-400 w-16 text-sm">Para:</span>
          <input 
            type="text" 
            placeholder="Seleccionar destinatario..."
            className="flex-1 outline-none text-sm"
            value={destinatario}
            onChange={(e) => setDestinatario(e.target.value)}
          />
        </div>

        {/* Campo: Asunto */}
        <div className="flex items-center border-b border-gray-100 py-4">
          <span className="text-gray-400 w-16 text-sm">Asunto:</span>
          <input 
            type="text" 
            placeholder="Asunto del mensaje"
            className="flex-1 outline-none font-semibold text-slate-800"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
          />
        </div>

        {/* Cuerpo del Correo */}
        <textarea 
          placeholder="Escribe tu mensaje aquí..."
          className="w-full h-80 mt-4 outline-none resize-none text-sm leading-relaxed"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
        />

        {/* Muestra el archivo si seleccionaste uno */}
        {archivoAdjunto && (
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-600" />
              <div>
                <p className="text-sm font-bold text-blue-900">{archivoAdjunto.name}</p>
                <p className="text-xs text-blue-500 uppercase">{(archivoAdjunto.size / (1024*1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <button onClick={() => setArchivoAdjunto(null)} className="text-blue-400 hover:text-red-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Botonera inferior */}
        <div className="pt-6 border-t border-gray-50 flex items-center gap-4">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
          <Button 
            variant="outline" 
            className="rounded-full border-gray-200 text-gray-500 gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-4 h-4" />
            Adjuntar documentos
          </Button>
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            Soporta PDF, ZIP y Videos pesados
          </span>
        </div>
      </main>
    </div>
  );
};

export default NewMessage;