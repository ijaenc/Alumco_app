import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button"; // Importamos el botón oficial

const AdminTrainingsView = () => {
  const navigate = useNavigate();

  const trainings = [
    { id: 1, titulo: "Derechos Humanos Fundamentales", desc: "Conceptos básicos y aplicación de los derechos humanos", icon: "📚", color: "bg-purple-100 text-purple-600", horas: "4", categoria: "DDHH" },
    { id: 2, titulo: "Gestión de Proyectos Sociales", desc: "Metodologías para administrar proyectos en ONG", icon: "📊", color: "bg-blue-100 text-blue-600", horas: "6", categoria: "Gestión" },
    { id: 3, titulo: "Comunicación Asertiva", desc: "Técnicas de expresión", icon: "💬", color: "bg-teal-100 text-teal-600", horas: "3", categoria: "Soft Skills" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        
        {/* Header con el botón y flecha oficial de Lucide */}
        <div className="mb-10 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/admin")} 
            className="text-gray-600 hover:bg-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Capacitaciones</h1>
            <p className="text-base text-slate-500">Vista general y estadísticas</p>
          </div>
        </div>

        {/* Grilla de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((train, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${train.color}`}>
                  {train.icon}
                </div>
                <h4 className="font-bold text-slate-800 text-xl mb-1">{train.titulo}</h4>
                <p className="text-sm text-slate-500 mb-3">{train.desc}</p>
                <div className="flex gap-2 mb-6">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">🕒 {train.horas} horas</span>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-semibold">{train.categoria}</span>
                </div>
              </div>
              <Link to="/admin/training-detail" className="w-full text-center py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 transition block">
                ◎ Ver Detalles
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminTrainingsView;