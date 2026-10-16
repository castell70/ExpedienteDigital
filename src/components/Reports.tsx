import { useState } from 'react';
import { useAppContext } from '../App';

export default function Reports() {
  const { state } = useAppContext();
  const [activeReport, setActiveReport] = useState('overview');

  const reports = [
    { id: 'overview', label: 'Vista General', icon: 'fa-chart-pie' },
    { id: 'employees', label: 'Empleados', icon: 'fa-users' },
    { id: 'requests', label: 'Solicitudes', icon: 'fa-file-alt' },
    { id: 'recruitment', label: 'Reclutamiento', icon: 'fa-user-tie' },
    { id: 'evaluations', label: 'Evaluaciones', icon: 'fa-star-half-alt' },
    { id: 'trainings', label: 'Capacitaciones', icon: 'fa-graduation-cap' },
  ];

  // Data calculations
  const deptData = state.departments.map(d => ({
    name: d.name,
    employees: state.employees.filter(e => e.departmentId === d.id).length,
    plazas: d.plazas.length,
    candidates: state.candidates.filter(c => c.departmentId === d.id).length,
  }));

  const requestStats = {
    total: state.requests.length,
    pending: state.requests.filter(r => r.status === 'Pendiente').length,
    approved: state.requests.filter(r => r.status === 'Aprobado').length,
    rejected: state.requests.filter(r => r.status === 'Rechazado').length,
  };

  const candidateStats = {
    total: state.candidates.length,
    review: state.candidates.filter(c => c.status === 'En Revisión').length,
    interview: state.candidates.filter(c => c.status === 'Entrevista').length,
    hired: state.candidates.filter(c => c.status === 'Contratado').length,
    discarded: state.candidates.filter(c => c.status === 'Descartado').length,
  };

  const evalStats = {
    total: state.evaluations.length,
    completed: state.evaluations.filter(e => e.status === 'Completada').length,
    avgScore: state.evaluations.filter(e => e.status === 'Completada').length > 0
      ? Math.round(state.evaluations.filter(e => e.status === 'Completada').reduce((a, e) => a + e.score, 0) / state.evaluations.filter(e => e.status === 'Completada').length)
      : 0,
  };

  const trainingStats = {
    total: state.trainings.length,
    completed: state.trainings.filter(t => t.status === 'Completado').length,
    inProgress: state.trainings.filter(t => t.status === 'En Progreso').length,
    pending: state.trainings.filter(t => t.status === 'Pendiente').length,
    totalHours: state.trainings.reduce((a, t) => a + t.hours, 0),
  };

  // SVG Pie Chart
  const PieChart = ({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) => {
    const total = data.reduce((a, d) => a + d.value, 0);
    if (total === 0) return <div className="text-center text-slate-400 py-8">Sin datos</div>;

    let cumulative = 0;
    const paths = data.map((d, i) => {
      const start = cumulative;
      cumulative += d.value;
      const startAngle = (start / total) * 2 * Math.PI - Math.PI / 2;
      const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
      const largeArc = d.value / total > 0.5 ? 1 : 0;
      const x1 = 50 + 40 * Math.cos(startAngle);
      const y1 = 50 + 40 * Math.sin(startAngle);
      const x2 = 50 + 40 * Math.cos(endAngle);
      const y2 = 50 + 40 * Math.sin(endAngle);
      return (
        <path
          key={i}
          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
          fill={colors[i % colors.length]}
          stroke="white"
          strokeWidth="1"
        />
      );
    });

    return (
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 100 100" className="w-32 h-32">{paths}</svg>
        <div className="space-y-1">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[i % colors.length] }}></div>
              <span className="text-slate-600">{d.label}: <strong>{d.value}</strong></span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Bar Chart
  const BarChart = ({ data, color = '#3b82f6' }: { data: { label: string; value: number }[]; color?: string }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600">{d.label}</span>
              <span className="font-semibold text-slate-800">{d.value}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${(d.value / max) * 100}%`, backgroundColor: color }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Export report
  const exportReport = (format: 'json' | 'csv' | 'pdf') => {
    let content = '';
    let filename = '';
    let type = '';

    if (format === 'json') {
      const reportData = {
        company: state.companyData.name,
        generatedAt: new Date().toISOString(),
        report: activeReport,
        data: {
          employees: state.employees.length,
          departments: state.departments.length,
          requests: requestStats,
          candidates: candidateStats,
          evaluations: evalStats,
          trainings: trainingStats,
        }
      };
      content = JSON.stringify(reportData, null, 2);
      filename = `Reporte_${activeReport}_${new Date().toISOString().split('T')[0]}.json`;
      type = 'application/json';
    } else if (format === 'csv') {
      let rows: string[] = [];
      if (activeReport === 'employees') {
        rows = ['ID,Nombre,Email,Departamento,Puesto,Estado'];
        state.employees.forEach(e => {
          rows.push(`"${e.id}","${e.name}","${e.email}","${e.department}","${e.position}","${e.status}"`);
        });
      } else if (activeReport === 'requests') {
        rows = ['ID,Empleado,Tipo,Inicio,Fin,Estado'];
        state.requests.forEach(r => {
          rows.push(`"${r.id}","${r.employeeName}","${r.type}","${r.startDate}","${r.endDate}","${r.status}"`);
        });
      } else if (activeReport === 'recruitment') {
        rows = ['ID,Nombre,Puesto,Estado,Fecha,Fuente'];
        state.candidates.forEach(c => {
          rows.push(`"${c.id}","${c.name}","${c.position}","${c.status}","${c.appliedDate}","${c.source}"`);
        });
      } else {
        rows = ['Concepto,Valor'];
        rows.push(`Total Empleados,${state.employees.length}`);
        rows.push(`Total Solicitudes,${requestStats.total}`);
        rows.push(`Total Candidatos,${candidateStats.total}`);
        rows.push(`Total Evaluaciones,${evalStats.total}`);
      }
      content = rows.join('\n');
      filename = `Reporte_${activeReport}_${new Date().toISOString().split('T')[0]}.csv`;
      type = 'text/csv';
    } else {
      // PDF - generate HTML printable
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`
          <html><head><title>Reporte ${activeReport}</title>
          <style>body{font-family:Arial;padding:40px}h1{color:#1e40af}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f4f6}</style>
          </head><body>
          <h1>Reporte de ${activeReport}</h1>
          <p><strong>Empresa:</strong> ${state.companyData.name}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-SV')}</p>
          <p><strong>Generado por:</strong> ${state.currentEmployee.name}</p>
          <h2>Resumen</h2>
          <ul>
            <li>Empleados: ${state.employees.length}</li>
            <li>Departamentos: ${state.departments.length}</li>
            <li>Solicitudes: ${requestStats.total}</li>
            <li>Candidatos: ${candidateStats.total}</li>
            <li>Evaluaciones: ${evalStats.total}</li>
          </ul>
          <p style="margin-top:40px;font-size:10px;color:#666">© 2026 Carlos Alfredo Castillo Flores - ITCPO - Talent360 Hub</p>
          </body></html>
        `);
        w.document.close();
        setTimeout(() => w.print(), 500);
      }
      return;
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <i className="fas fa-chart-bar text-blue-600"></i>
              Centro de Reportes
            </h3>
            <p className="text-sm text-slate-500 mt-1">Análisis y métricas de la organización</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportReport('json')}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
            >
              <i className="fas fa-file-code mr-1"></i>JSON
            </button>
            <button
              onClick={() => exportReport('csv')}
              className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors"
            >
              <i className="fas fa-file-csv mr-1"></i>CSV
            </button>
            <button
              onClick={() => exportReport('pdf')}
              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium transition-colors"
            >
              <i className="fas fa-file-pdf mr-1"></i>PDF
            </button>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          {reports.map(r => (
            <button
              key={r.id}
              onClick={() => setActiveReport(r.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeReport === r.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <i className={`fas ${r.icon}`}></i>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      {activeReport === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-building text-blue-600"></i>
              Empleados por Departamento
            </h4>
            <BarChart
              data={deptData.map(d => ({ label: d.name, value: d.employees }))}
              color="#3b82f6"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-file-alt text-orange-600"></i>
              Estado de Solicitudes
            </h4>
            <PieChart
              data={[
                { label: 'Pendientes', value: requestStats.pending },
                { label: 'Aprobadas', value: requestStats.approved },
                { label: 'Rechazadas', value: requestStats.rejected },
              ]}
              colors={['#f59e0b', '#10b981', '#ef4444']}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-user-tie text-purple-600"></i>
              Pipeline de Candidatos
            </h4>
            <PieChart
              data={[
                { label: 'En Revisión', value: candidateStats.review },
                { label: 'Entrevista', value: candidateStats.interview },
                { label: 'Contratados', value: candidateStats.hired },
                { label: 'Descartados', value: candidateStats.discarded },
              ]}
              colors={['#f59e0b', '#3b82f6', '#10b981', '#ef4444']}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-graduation-cap text-green-600"></i>
              Resumen de Capacitaciones
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">{trainingStats.completed}</p>
                <p className="text-xs text-blue-600">Completadas</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-orange-700">{trainingStats.inProgress}</p>
                <p className="text-xs text-orange-600">En Progreso</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-slate-700">{trainingStats.pending}</p>
                <p className="text-xs text-slate-600">Pendientes</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{trainingStats.totalHours}h</p>
                <p className="text-xs text-green-600">Horas Totales</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'employees' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h4 className="font-semibold text-slate-800 mb-4">Listado de Empleados</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Departamento</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Puesto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Ingreso</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.employees.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-600">{e.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{e.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{e.department}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{e.position}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{e.startDate}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${e.status === 'Activo' ? 'badge-green' : e.status === 'Vacaciones' ? 'badge-blue' : 'badge-yellow'}`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h4 className="font-semibold text-slate-800 mb-4">Distribución por Estado</h4>
            <PieChart
              data={[
                { label: 'Pendientes', value: requestStats.pending },
                { label: 'Aprobadas', value: requestStats.approved },
                { label: 'Rechazadas', value: requestStats.rejected },
              ]}
              colors={['#f59e0b', '#10b981', '#ef4444']}
            />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h4 className="font-semibold text-slate-800 mb-4">Resumen</h4>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Total Solicitudes</span>
                <span className="font-bold text-slate-800">{requestStats.total}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Tasa de Aprobación</span>
                <span className="font-bold text-green-700">
                  {requestStats.total > 0 ? Math.round((requestStats.approved / requestStats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Tasa de Rechazo</span>
                <span className="font-bold text-red-700">
                  {requestStats.total > 0 ? Math.round((requestStats.rejected / requestStats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'recruitment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h4 className="font-semibold text-slate-800 mb-4">Pipeline de Candidatos</h4>
            <PieChart
              data={[
                { label: 'En Revisión', value: candidateStats.review },
                { label: 'Entrevista', value: candidateStats.interview },
                { label: 'Contratados', value: candidateStats.hired },
                { label: 'Descartados', value: candidateStats.discarded },
              ]}
              colors={['#f59e0b', '#3b82f6', '#10b981', '#ef4444']}
            />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h4 className="font-semibold text-slate-800 mb-4">Métricas Clave</h4>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Total Candidatos</span>
                <span className="font-bold text-slate-800">{candidateStats.total}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Tasa de Contratación</span>
                <span className="font-bold text-green-700">
                  {candidateStats.total > 0 ? Math.round((candidateStats.hired / candidateStats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Candidatos Activos</span>
                <span className="font-bold text-blue-700">{candidateStats.review + candidateStats.interview}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'evaluations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h4 className="font-semibold text-slate-800 mb-4">Estado de Evaluaciones</h4>
            <PieChart
              data={[
                { label: 'Completadas', value: evalStats.completed },
                { label: 'En Proceso', value: state.evaluations.filter(e => e.status === 'En Proceso').length },
                { label: 'Programadas', value: state.evaluations.filter(e => e.status === 'Programada').length },
              ]}
              colors={['#10b981', '#3b82f6', '#f59e0b']}
            />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h4 className="font-semibold text-slate-800 mb-4">Puntuaciones</h4>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Puntuación Promedio</span>
                <span className="font-bold text-purple-700">{evalStats.avgScore}/100</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Total Evaluaciones</span>
                <span className="font-bold text-slate-800">{evalStats.total}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Completadas</span>
                <span className="font-bold text-green-700">{evalStats.completed}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'trainings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h4 className="font-semibold text-slate-800 mb-4">Estado de Capacitaciones</h4>
            <PieChart
              data={[
                { label: 'Completadas', value: trainingStats.completed },
                { label: 'En Progreso', value: trainingStats.inProgress },
                { label: 'Pendientes', value: trainingStats.pending },
              ]}
              colors={['#10b981', '#3b82f6', '#94a3b8']}
            />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h4 className="font-semibold text-slate-800 mb-4">Métricas de Capacitación</h4>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Total Cursos</span>
                <span className="font-bold text-slate-800">{trainingStats.total}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Horas Totales</span>
                <span className="font-bold text-blue-700">{trainingStats.totalHours}h</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Promedio por Empleado</span>
                <span className="font-bold text-purple-700">
                  {state.employees.length > 0 ? (trainingStats.totalHours / state.employees.length).toFixed(1) : 0}h
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
