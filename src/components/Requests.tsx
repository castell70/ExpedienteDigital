import { useState } from 'react';
import { useAppContext, Request } from '../App';

export default function Requests() {
  const { state, setState } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    employeeId: state.currentEmployee.id,
    type: 'Vacaciones',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const selectedEmployee = state.employees.find(e => e.id === formData.employeeId);
  const myRequests = state.requests.filter(r => r.employeeId === state.currentEmployee.id);
  const filteredRequests = state.requests.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = searchTerm === '' ||
      r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const empName = selectedEmployee?.name || state.currentEmployee.name;
    const newRequest: Request = {
      id: `REQ${Date.now()}`,
      employeeId: formData.employeeId,
      employeeName: empName,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: 'Pendiente',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setState(prev => ({ ...prev, requests: [newRequest, ...prev.requests] }));
    setShowForm(false);
    setFormData({ employeeId: state.currentEmployee.id, type: 'Vacaciones', startDate: '', endDate: '', reason: '' });
  };

  const handleApprove = (id: string) => {
    setState(prev => ({
      ...prev,
      requests: prev.requests.map(r => r.id === id ? { ...r, status: 'Aprobado' as const } : r)
    }));
  };

  const handleReject = (id: string) => {
    setState(prev => ({
      ...prev,
      requests: prev.requests.map(r => r.id === id ? { ...r, status: 'Rechazado' as const } : r)
    }));
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Aprobado': return 'badge-green';
      case 'Pendiente': return 'badge-yellow';
      case 'Rechazado': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  const totalVacationDays = 15;
  const usedDays = myRequests.filter(r => r.type === 'Vacaciones' && r.status === 'Aprobado').length * 7;
  const availableDays = totalVacationDays - usedDays;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Días Disponibles</p>
              <p className="text-2xl font-bold text-green-700">{availableDays}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-calendar-check text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Días Usados</p>
              <p className="text-2xl font-bold text-orange-700">{usedDays}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-calendar-minus text-orange-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-700">{state.requests.filter(r => r.status === 'Pendiente').length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Solicitudes</p>
              <p className="text-2xl font-bold text-blue-700">{state.requests.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-file-alt text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* New Request Button & Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            <i className="fas fa-plus-circle text-blue-600 mr-2"></i>
            Nueva Solicitud
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <i className="fas fa-plus mr-2"></i>
            {showForm ? 'Cancelar' : 'Crear Solicitud'}
          </button>
        </div>

        {showForm && (
          <div className="p-5 bg-gray-50 border-b border-gray-100">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {state.employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Solicitud</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Vacaciones">Vacaciones</option>
                  <option value="Permiso Personal">Permiso Personal</option>
                  <option value="Permiso Médico">Permiso Médico</option>
                  <option value="Licencia Especial">Licencia Especial</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <input
                  type="text"
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Describe el motivo de tu solicitud"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <i className="fas fa-paper-plane mr-2"></i>Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests Table */}
        <div className="p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
            <h4 className="font-semibold text-gray-700">Historial de Solicitudes</h4>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 w-40"
                />
              </div>
              {['all', 'Pendiente', 'Aprobado', 'Rechazado'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'Todos' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Empleado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Período</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Motivo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{req.employeeName}</p>
                        <p className="text-xs text-gray-400">{req.employeeId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge badge-blue">{req.type}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{req.startDate} → {req.endDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{req.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusBadge(req.status)}`}>{req.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {req.status === 'Pendiente' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                            title="Aprobar"
                          >
                            <i className="fas fa-check-circle"></i>
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                            title="Rechazar"
                          >
                            <i className="fas fa-times-circle"></i>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
