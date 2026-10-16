import { useState, useRef } from 'react';
import { useAppContext, Candidate, Employee } from '../App';

export default function Recruitment() {
  const { state, setState } = useAppContext();
  const [activeTab, setActiveTab] = useState<'internal' | 'external' | 'import'>('internal');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterSkill, setFilterSkill] = useState('');
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [bulkPreview, setBulkPreview] = useState<Candidate[]>([]);
  const [candidateForm, setCandidateForm] = useState({
    name: '', email: '', phone: '', position: '', skills: '', source: 'Portal Web',
    departmentId: '', plazaId: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hiring modal
  const [hiringCandidate, setHiringCandidate] = useState<Candidate | null>(null);
  const [hiringForm, setHiringForm] = useState({
    departmentId: '',
    plazaId: '',
    startDate: new Date().toISOString().split('T')[0],
    email: '',
    phone: '',
  });

  const departments = state.departments;
  const allSkills = [...new Set(state.employees.flatMap(e => e.skills))];

  // Get plazas for selected department
  const getPlazasForDept = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.plazas : [];
  };

  // Internal talent search
  const filteredEmployees = state.employees.filter(emp => {
    const matchesSearch = searchTerm === '' ||
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = filterDept === 'all' || emp.departmentId === filterDept;
    const matchesSkill = filterSkill === '' || emp.skills.includes(filterSkill);
    return matchesSearch && matchesDept && matchesSkill;
  });

  // External candidates
  const filteredCandidates = state.candidates.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find(d => d.id === candidateForm.departmentId);
    const plaza = dept?.plazas.find(p => p.id === candidateForm.plazaId);

    const newCandidate: Candidate = {
      id: `CAN${Date.now()}`,
      name: candidateForm.name,
      email: candidateForm.email,
      phone: candidateForm.phone,
      position: plaza?.name || candidateForm.position,
      plazaId: candidateForm.plazaId || undefined,
      departmentId: candidateForm.departmentId || undefined,
      skills: candidateForm.skills.split(',').map(s => s.trim()).filter(Boolean),
      status: 'En Revisión',
      appliedDate: new Date().toISOString().split('T')[0],
      source: candidateForm.source,
    };
    setState(prev => ({ ...prev, candidates: [newCandidate, ...prev.candidates] }));
    setShowAddCandidate(false);
    setCandidateForm({ name: '', email: '', phone: '', position: '', skills: '', source: 'Portal Web', departmentId: '', plazaId: '' });
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      const parsed: Candidate[] = lines.slice(1).map((line, idx) => {
        const values = line.split(',').map(v => v.trim());
        const nameIdx = headers.indexOf('name') !== -1 ? headers.indexOf('name') : headers.indexOf('nombre');
        const emailIdx = headers.indexOf('email') !== -1 ? headers.indexOf('email') : headers.indexOf('correo');
        const posIdx = headers.indexOf('position') !== -1 ? headers.indexOf('position') : headers.indexOf('puesto');
        const skillIdx = headers.indexOf('skills') !== -1 ? headers.indexOf('skills') : headers.indexOf('habilidades');

        return {
          id: `CAN${Date.now()}${idx}`,
          name: values[nameIdx] || `Candidato ${idx + 1}`,
          email: values[emailIdx] || 'sin-email@email.com',
          phone: values[headers.indexOf('phone')] || values[headers.indexOf('telefono')] || '',
          position: values[posIdx] || 'Sin definir',
          skills: (values[skillIdx] || '').split(';').map(s => s.trim()).filter(Boolean),
          status: 'En Revisión' as const,
          appliedDate: new Date().toISOString().split('T')[0],
          source: 'CSV Import',
        };
      });

      setBulkPreview(parsed);
    };
    reader.readAsText(file);
  };

  const confirmBulkImport = () => {
    setState(prev => ({ ...prev, candidates: [...bulkPreview, ...prev.candidates] }));
    setBulkPreview([]);
  };

  // Handle status change - trigger hiring flow when "Contratado"
  const handleStatusChange = (candidate: Candidate, newStatus: Candidate['status']) => {
    if (newStatus === 'Contratado' && candidate.status !== 'Contratado') {
      // Open hiring modal
      setHiringCandidate(candidate);
      setHiringForm({
        departmentId: candidate.departmentId || '',
        plazaId: candidate.plazaId || '',
        startDate: new Date().toISOString().split('T')[0],
        email: candidate.email,
        phone: candidate.phone,
      });
    } else {
      // Regular status update
      setState(prev => ({
        ...prev,
        candidates: prev.candidates.map(c => c.id === candidate.id ? { ...c, status: newStatus } : c)
      }));
    }
  };

  // Confirm hiring - creates employee and links to candidate
  const confirmHiring = () => {
    if (!hiringCandidate || !hiringForm.departmentId || !hiringForm.plazaId) {
      alert('Por favor selecciona un departamento y una plaza.');
      return;
    }

    const dept = departments.find(d => d.id === hiringForm.departmentId);
    const plaza = dept?.plazas.find(p => p.id === hiringForm.plazaId);

    if (!dept || !plaza) return;

    // Create new employee
    const newEmployee: Employee = {
      id: `EMP${Date.now()}`,
      name: hiringCandidate.name,
      email: hiringForm.email || hiringCandidate.email,
      phone: hiringForm.phone || hiringCandidate.phone,
      department: dept.name,
      departmentId: dept.id,
      position: plaza.name,
      plazaId: plaza.id,
      startDate: hiringForm.startDate,
      skills: hiringCandidate.skills,
      certifications: [],
      status: 'Activo',
    };

    setState(prev => ({
      ...prev,
      employees: [...prev.employees, newEmployee],
      candidates: prev.candidates.map(c =>
        c.id === hiringCandidate.id
          ? { ...c, status: 'Contratado' as const, hiredEmployeeId: newEmployee.id, departmentId: dept.id, plazaId: plaza.id }
          : c
      ),
    }));

    // Close modal and switch to profile tab
    setHiringCandidate(null);
    setActiveTab('external');
    alert(`✅ ${hiringCandidate.name} ha sido contratado como ${plaza.name} en ${dept.name}.\n\nAhora puedes ir al módulo "Expediente Digital" para completar su información.`);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'En Revisión': return 'badge-yellow';
      case 'Entrevista': return 'badge-blue';
      case 'Contratado': return 'badge-green';
      case 'Descartado': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  const getDeptName = (deptId?: string) => {
    if (!deptId) return 'Sin asignar';
    return departments.find(d => d.id === deptId)?.name || 'Sin asignar';
  };

  const getPlazaName = (plazaId?: string) => {
    if (!plazaId) return 'Sin asignar';
    for (const dept of departments) {
      const plaza = dept.plazas.find(p => p.id === plazaId);
      if (plaza) return plaza.name;
    }
    return 'Sin asignar';
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Talento Interno</p>
              <p className="text-2xl font-bold text-blue-700">{state.employees.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-users text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Candidatos Totales</p>
              <p className="text-2xl font-bold text-purple-700">{state.candidates.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-user-plus text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En Entrevista</p>
              <p className="text-2xl font-bold text-orange-700">{state.candidates.filter(c => c.status === 'Entrevista').length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-comments text-orange-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Contratados</p>
              <p className="text-2xl font-bold text-green-700">{state.candidates.filter(c => c.status === 'Contratado').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-handshake text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-100">
          {[
            { id: 'internal', label: 'Talento Interno', icon: 'fa-search' },
            { id: 'external', label: 'Banco de Candidatos', icon: 'fa-user-tie' },
            { id: 'import', label: 'Carga Masiva', icon: 'fa-file-import' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className={`fas ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Internal Talent Search */}
          {activeTab === 'internal' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="text"
                      placeholder="Buscar por nombre o habilidad..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los Departamentos</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select
                  value={filterSkill}
                  onChange={(e) => setFilterSkill(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las Habilidades</option>
                  {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmployees.map(emp => (
                  <div key={emp.id} className="border border-gray-200 rounded-lg p-4 card-hover">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-semibold text-sm">{emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.department}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{emp.position}</p>
                    <p className="text-xs text-gray-400 mb-2"><i className="fas fa-building mr-1"></i>{getDeptName(emp.departmentId)}</p>
                    <div className="flex flex-wrap gap-1">
                      {emp.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{skill}</span>
                      ))}
                      {emp.skills.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">+{emp.skills.length - 3}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* External Candidates */}
          {activeTab === 'external' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Buscar candidato..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowAddCandidate(!showAddCandidate)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>Agregar Candidato
                </button>
              </div>

              {showAddCandidate && (
                <form onSubmit={handleAddCandidate} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h5 className="font-medium text-gray-700 mb-3">Nuevo Candidato</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input required placeholder="Nombre completo" value={candidateForm.name} onChange={e => setCandidateForm({ ...candidateForm, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    <input required type="email" placeholder="Email" value={candidateForm.email} onChange={e => setCandidateForm({ ...candidateForm, email: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    <input placeholder="Teléfono (ej: +503 7XXX XXXX)" value={candidateForm.phone} onChange={e => setCandidateForm({ ...candidateForm, phone: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    <select
                      value={candidateForm.departmentId}
                      onChange={(e) => setCandidateForm({ ...candidateForm, departmentId: e.target.value, plazaId: '' })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Seleccionar Departamento</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <select
                      value={candidateForm.plazaId}
                      onChange={(e) => setCandidateForm({ ...candidateForm, plazaId: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      disabled={!candidateForm.departmentId}
                    >
                      <option value="">Seleccionar Plaza / Puesto</option>
                      {getPlazasForDept(candidateForm.departmentId).map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.level})</option>
                      ))}
                    </select>
                    <select value={candidateForm.source} onChange={e => setCandidateForm({ ...candidateForm, source: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option>Portal Web</option>
                      <option>LinkedIn</option>
                      <option>Referido</option>
                      <option>Indeed</option>
                      <option>Otro</option>
                    </select>
                    <input placeholder="Habilidades (separadas por coma)" value={candidateForm.skills} onChange={e => setCandidateForm({ ...candidateForm, skills: e.target.value })} className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    <div className="md:col-span-2 flex justify-end gap-2">
                      <button type="button" onClick={() => setShowAddCandidate(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">Cancelar</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">Guardar Candidato</button>
                    </div>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Candidato</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Departamento</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plaza / Puesto</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Habilidades</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fuente</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCandidates.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-700">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{getDeptName(c.departmentId)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{getPlazaName(c.plazaId)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {c.skills.slice(0, 2).map((s, i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{c.source}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${statusBadge(c.status)}`}>{c.status}</span>
                          {c.status === 'Contratado' && c.hiredEmployeeId && (
                            <p className="text-xs text-green-600 mt-1">
                              <i className="fas fa-link mr-1"></i>
                              {c.hiredEmployeeId}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={c.status}
                            onChange={(e) => handleStatusChange(c, e.target.value as Candidate['status'])}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option>En Revisión</option>
                            <option>Entrevista</option>
                            <option>Contratado</option>
                            <option>Descartado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bulk Import */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2"><i className="fas fa-info-circle mr-2"></i>Formato CSV esperado</h4>
                <p className="text-sm text-blue-700 mb-2">El archivo CSV debe contener las siguientes columnas:</p>
                <code className="text-xs bg-blue-100 px-3 py-1.5 rounded block text-blue-800">
                  name,email,phone,position,skills
                </code>
                <p className="text-xs text-blue-600 mt-2">Las habilidades deben estar separadas por punto y coma (;)</p>
              </div>

              <div
                className="drop-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleCSVUpload}
                />
                <i className="fas fa-file-csv text-4xl text-green-500 mb-3"></i>
                <p className="text-gray-600 font-medium">Haz clic para cargar archivo CSV</p>
                <p className="text-sm text-gray-400 mt-1">Soporta archivos .csv con datos de candidatos</p>
              </div>

              {bulkPreview.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-700">
                      <i className="fas fa-table text-blue-600 mr-2"></i>
                      Previsualización ({bulkPreview.length} registros)
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setBulkPreview([])}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg text-sm"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={confirmBulkImport}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                      >
                        <i className="fas fa-check mr-2"></i>Confirmar Importación
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Nombre</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Email</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Puesto</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Habilidades</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bulkPreview.map((c, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">{c.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{c.email}</td>
                            <td className="px-4 py-2 text-sm">{c.position}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{c.skills.join(', ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hiring Modal */}
      {hiringCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-handshake text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Proceso de Contratación</h3>
                  <p className="text-green-100 text-sm">Candidato: {hiringCandidate.name}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <i className="fas fa-info-circle mr-2"></i>
                  Al confirmar, se creará un nuevo expediente de empleado. Podrás completarlo y editarlo desde el módulo "Expediente Digital".
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-building text-blue-500 mr-1"></i>Departamento Destino *
                  </label>
                  <select
                    required
                    value={hiringForm.departmentId}
                    onChange={(e) => setHiringForm({ ...hiringForm, departmentId: e.target.value, plazaId: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Seleccionar departamento...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-briefcase text-purple-500 mr-1"></i>Plaza / Puesto *
                  </label>
                  <select
                    required
                    value={hiringForm.plazaId}
                    onChange={(e) => setHiringForm({ ...hiringForm, plazaId: e.target.value })}
                    disabled={!hiringForm.departmentId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                  >
                    <option value="">Seleccionar plaza...</option>
                    {getPlazasForDept(hiringForm.departmentId).map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.level})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-calendar text-green-500 mr-1"></i>Fecha de Ingreso
                  </label>
                  <input
                    type="date"
                    value={hiringForm.startDate}
                    onChange={(e) => setHiringForm({ ...hiringForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-envelope text-orange-500 mr-1"></i>Email
                  </label>
                  <input
                    type="email"
                    value={hiringForm.email}
                    onChange={(e) => setHiringForm({ ...hiringForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-phone text-gray-500 mr-1"></i>Teléfono
                  </label>
                  <input
                    type="text"
                    value={hiringForm.phone}
                    onChange={(e) => setHiringForm({ ...hiringForm, phone: e.target.value })}
                    placeholder="+503 7XXX XXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Summary */}
              {hiringForm.departmentId && hiringForm.plazaId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <i className="fas fa-check-circle"></i>
                    Resumen de Contratación
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                    <p><strong>Candidato:</strong> {hiringCandidate.name}</p>
                    <p><strong>Departamento:</strong> {getDeptName(hiringForm.departmentId)}</p>
                    <p><strong>Plaza:</strong> {getPlazaName(hiringForm.plazaId)}</p>
                    <p><strong>Fecha Ingreso:</strong> {hiringForm.startDate}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setHiringCandidate(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmHiring}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium shadow-sm"
              >
                <i className="fas fa-user-check mr-2"></i>Confirmar Contratación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
