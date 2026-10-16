import { useState } from 'react';
import { useAppContext, Evaluation } from '../App';

export default function Evaluations() {
  const { state, setState } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  const [form, setForm] = useState({
    employeeId: '',
    evaluator: '',
    type: 'Desempeño' as Evaluation['type'],
    period: '',
    date: '',
    score: 0,
    strengths: '',
    improvements: '',
    goals: '',
    status: 'Programada' as Evaluation['status'],
    comments: '',
  });

  const filtered = state.evaluations.filter(e => filter === 'all' || e.status === filter);

  const resetForm = () => {
    setForm({
      employeeId: '', evaluator: '', type: 'Desempeño',
      period: '', date: '', score: 0, strengths: '', improvements: '',
      goals: '', status: 'Programada', comments: '',
    });
    setEditingId(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (ev: Evaluation) => {
    setForm({
      employeeId: ev.employeeId,
      evaluator: ev.evaluator,
      type: ev.type,
      period: ev.period,
      date: ev.date,
      score: ev.score,
      strengths: ev.strengths.join(', '),
      improvements: ev.improvements.join(', '),
      goals: ev.goals.join(', '),
      status: ev.status,
      comments: ev.comments,
    });
    setEditingId(ev.id);
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = state.employees.find(emp => emp.id === form.employeeId);

    const data: Evaluation = {
      id: editingId || `EVAL${Date.now()}`,
      employeeId: form.employeeId,
      employeeName: emp?.name || '',
      evaluator: form.evaluator,
      type: form.type,
      period: form.period,
      date: form.date,
      score: form.score,
      strengths: form.strengths.split(',').map(s => s.trim()).filter(Boolean),
      improvements: form.improvements.split(',').map(s => s.trim()).filter(Boolean),
      goals: form.goals.split(',').map(s => s.trim()).filter(Boolean),
      status: form.status,
      comments: form.comments,
    };

    if (editingId) {
      setState(prev => ({
        ...prev,
        evaluations: prev.evaluations.map(ev => ev.id === editingId ? data : ev),
      }));
    } else {
      setState(prev => ({ ...prev, evaluations: [data, ...prev.evaluations] }));
    }
    setShowForm(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta evaluación?')) {
      setState(prev => ({ ...prev, evaluations: prev.evaluations.filter(e => e.id !== id) }));
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case 'Completada': return 'badge-green';
      case 'En Proceso': return 'badge-blue';
      case 'Programada': return 'badge-yellow';
      default: return 'badge-gray';
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // Stats
  const completed = state.evaluations.filter(e => e.status === 'Completada');
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((a, e) => a + e.score, 0) / completed.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Evaluaciones</p>
              <p className="text-2xl font-bold text-blue-700">{state.evaluations.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-clipboard-list text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Completadas</p>
              <p className="text-2xl font-bold text-green-700">{completed.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Puntuación Promedio</p>
              <p className="text-2xl font-bold text-purple-700">{avgScore}/100</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-star text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">En Proceso</p>
              <p className="text-2xl font-bold text-orange-700">{state.evaluations.filter(e => e.status === 'En Proceso').length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-spinner text-orange-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-800">
              <i className="fas fa-star-half-alt text-blue-600 mr-2"></i>
              Evaluaciones de Desempeño
            </h3>
            <div className="flex gap-1">
              {['all', 'Programada', 'En Proceso', 'Completada'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f === 'all' ? 'Todas' : f}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <i className="fas fa-plus mr-2"></i>Nueva Evaluación
          </button>
        </div>

        <div className="p-5">
          {showForm && (
            <form onSubmit={handleSave} className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-4">
              <h5 className="font-medium text-slate-700 mb-3">
                {editingId ? 'Editar Evaluación' : 'Nueva Evaluación'}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Empleado *</label>
                  <select
                    required
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="">Seleccionar empleado...</option>
                    {state.employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Evaluador *</label>
                  <input
                    required
                    type="text"
                    value={form.evaluator}
                    onChange={(e) => setForm({ ...form, evaluator: e.target.value })}
                    placeholder="Nombre del evaluador"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as Evaluation['type'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option>Desempeño</option>
                    <option>360°</option>
                    <option>Objetivos</option>
                    <option>Competencias</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Período</label>
                  <input
                    type="text"
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                    placeholder="Ej: Q1-2026, Anual-2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Puntuación (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.score}
                    onChange={(e) => setForm({ ...form, score: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Estado</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Evaluation['status'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option>Programada</option>
                    <option>En Proceso</option>
                    <option>Completada</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fortalezas (separadas por coma)</label>
                  <input
                    type="text"
                    value={form.strengths}
                    onChange={(e) => setForm({ ...form, strengths: e.target.value })}
                    placeholder="Ej: Liderazgo, Comunicación, Proactividad"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Áreas de Mejora (separadas por coma)</label>
                  <input
                    type="text"
                    value={form.improvements}
                    onChange={(e) => setForm({ ...form, improvements: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Objetivos (separados por coma)</label>
                  <input
                    type="text"
                    value={form.goals}
                    onChange={(e) => setForm({ ...form, goals: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Comentarios</label>
                  <textarea
                    value={form.comments}
                    onChange={(e) => setForm({ ...form, comments: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); resetForm(); }}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                  >
                    <i className="fas fa-save mr-1"></i>
                    {editingId ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Evaluations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(ev => (
              <div
                key={ev.id}
                onClick={() => setSelectedEval(ev)}
                className="border border-slate-200 rounded-lg p-4 card-hover cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-semibold text-sm">
                        {ev.employeeName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{ev.employeeName}</p>
                      <p className="text-xs text-slate-500">{ev.type} • {ev.period}</p>
                    </div>
                  </div>
                  {ev.score > 0 && (
                    <div className={`px-3 py-1 rounded-lg border text-sm font-bold ${scoreColor(ev.score)}`}>
                      {ev.score}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    <i className="fas fa-user-tie mr-1"></i>
                    {ev.evaluator}
                  </span>
                  <span className={`badge ${statusBadge(ev.status)}`}>{ev.status}</span>
                </div>
                {ev.strengths.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {ev.strengths.slice(0, 2).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEval(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedEval.employeeName}</h3>
                  <p className="text-blue-100 text-sm mt-1">{selectedEval.type} • {selectedEval.period}</p>
                </div>
                {selectedEval.score > 0 && (
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">{selectedEval.score}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Evaluador:</span> <span className="font-medium text-slate-800">{selectedEval.evaluator}</span></div>
                <div><span className="text-slate-500">Fecha:</span> <span className="font-medium text-slate-800">{selectedEval.date}</span></div>
                <div><span className="text-slate-500">Estado:</span> <span className={`badge ${statusBadge(selectedEval.status)}`}>{selectedEval.status}</span></div>
              </div>

              {selectedEval.strengths.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <i className="fas fa-thumbs-up text-green-600"></i>Fortalezas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEval.strengths.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEval.improvements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <i className="fas fa-tools text-orange-600"></i>Áreas de Mejora
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEval.improvements.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEval.goals.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <i className="fas fa-bullseye text-blue-600"></i>Objetivos
                  </h4>
                  <ul className="space-y-1">
                    {selectedEval.goals.map((g, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <i className="fas fa-check-circle text-blue-500 mt-0.5"></i>{g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedEval.comments && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Comentarios</h4>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{selectedEval.comments}</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 rounded-b-xl">
              <button
                onClick={() => { setSelectedEval(null); handleEdit(selectedEval); }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                <i className="fas fa-edit mr-1"></i>Editar
              </button>
              <button
                onClick={() => setSelectedEval(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
