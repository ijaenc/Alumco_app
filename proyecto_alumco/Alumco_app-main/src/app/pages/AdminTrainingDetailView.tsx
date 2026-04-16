import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button"; // Importamos el botón oficial

const AdminTrainingDetailView = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header con botón y flecha oficial */}
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/admin/trainings-view")} 
            className="text-gray-600 hover:bg-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Detalle de Capacitación</h1>
            <p className="text-sm text-slate-500">Vista de supervisión</p>
          </div>
        </div>

        {/* Tarjeta de Info (El resto sigue igual para no marearte) */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Derechos Humanos Fundamentales</h2>
          <p className="text-gray-500 text-sm mb-4">Conceptos básicos y aplicación de los derechos humanos en el trabajo de ONG</p>
          <div className="flex gap-2 mb-8">
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-xs font-semibold">DDHH</span>
            <span className="bg-green-50 text-green-600 px-3 py-1 rounded-md text-xs font-semibold border border-green-200">Activa</span>
          </div>
          <div className="flex gap-16 border-t border-gray-100 pt-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">Duración</p>
              <p className="font-bold text-sm text-slate-800">4 horas</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Creada por</p>
              <p className="font-bold text-sm text-slate-800">Prof. Carlos Méndez</p>
            </div>
          </div>
        </div>

        {/* Tarjeta de Estadísticas Simplificada para el Admin */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Estadísticas de Rendimiento</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-2xl">
              <p className="text-2xl font-bold text-blue-700">186</p>
              <p className="text-xs text-blue-600">Certificados emitidos</p>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl">
              <p className="text-2xl font-bold text-green-700">87%</p>
              <p className="text-xs text-green-600">Promedio general</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminTrainingDetailView;