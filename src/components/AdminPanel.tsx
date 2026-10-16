import { useState, useRef } from 'react';
import { useAppContext, Department, Plaza } from '../App';

export default function AdminPanel() {
  const { state, setState } = useAppContext();
  const [activeTab, setActiveTab] = useState<'company' | 'departments' | 'plazas' | 'backup'>('company');
  const [importStatus, setImportStatus] = useState<string>('');
  const [exportStatus, setExportStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Company form
  const [companyForm, setCompanyForm] = useState(state.companyData);
  const [editingCompany, setEditingCompany] = useState(false);

  // Departments
  const [selectedDeptId, setSelectedDeptId] = useState<string>(state.departments[0]?.id || '');
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [showPlazaForm, setShowPlazaForm] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editingPlazaId, setEditingPlazaId] = useState<string | null>(null);
  const [deptForm, setDeptForm] = useState({ name: '', description: '', manager: '' });
  const [plazaForm, setPlazaForm] = useState({ name: '', description: '', level: 'Junior', minSalary: 0, maxSalary: 0 });

  const selectedDept = state.departments.find(d => d.id === selectedDeptId);

  // ============ COMPANY ============
  const saveCompany = () => {
    setState(prev => ({ ...prev, companyData: companyForm }));
    setEditingCompany(false);
    setExportStatus('Datos de empresa actualizados');
    setTimeout(() => setExportStatus(''), 3000);
  };

  // ============ DEPARTMENTS ============
  const handleAddDept = () => {
    setDeptForm({ name: '', description: '', manager: '' });
    setEditingDeptId(null);
    setShowDeptForm(true);
  };

  const handleEditDept = (dept: Department) => {
    setDeptForm({ name: dept.name, description: dept.description, manager: dept.manager });
    setEditingDeptId(dept.id);
    setShowDeptForm(true);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDeptId) {
      setState(prev => ({
        ...prev,
        departments: prev.departments.map(d => d.id === editingDeptId ? { ...d, ...deptForm } : d),
      }));
    } else {
      const newDept: Department = {
        id: `DEP${Date.now()}`,
        name: deptForm.name,
        description: deptForm.description,
        manager: deptForm.manager,
        plazas: [],
      };
      setState(prev => ({ ...prev, departments: [...prev.departments, newDept] }));
    }
    setShowDeptForm(false);
    setEditingDeptId(null);
  };

  const handleDeleteDept = (id: string) => {
    if (confirm('¿Eliminar este departamento?')) {
      setState(prev => ({ ...prev, departments: prev.departments.filter(d => d.id !== id) }));
    }
  };

  // ============ PLAZAS ============
  const handleAddPlaza = () => {
    setPlazaForm({ name: '', description: '', level: 'Junior', minSalary: 0, maxSalary: 0 });
    setEditingPlazaId(null);
    setShowPlazaForm(true);
  };

  const handleEditPlaza = (plaza: Plaza) => {
    setPlazaForm({ name: plaza.name, description: plaza.description, level: plaza.level, minSalary: plaza.minSalary, maxSalary: plaza.maxSalary });
    setEditingPlazaId(plaza.id);
    setShowPlazaForm(true);
  };

  const handleSavePlaza = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId) return;
    if (editingPlazaId) {
      setState(prev => ({
        ...prev,
        departments: prev.departments.map(d =>
          d.id === selectedDeptId
            ? { ...d, plazas: d.plazas.map(p => p.id === editingPlazaId ? { ...p, ...plazaForm } : p) }
            : d
        ),
      }));
    } else {
      const newPlaza: Plaza = {
        id: `PLZ${Date.now()}`,
        name: plazaForm.name,
        description: plazaForm.description,
        level: plazaForm.level,
        minSalary: plazaForm.minSalary,
        maxSalary: plazaForm.maxSalary,
      };
      setState(prev => ({
        ...prev,
        departments: prev.departments.map(d =>
          d.id === selectedDeptId ? { ...d, plazas: [...d.plazas, newPlaza] } : d
        ),
      }));
    }
    setShowPlazaForm(false);
    setEditingPlazaId(null);
  };

  const handleDeletePlaza = (plazaId: string) => {
    if (confirm('¿Eliminar esta plaza?')) {
      setState(prev => ({
        ...prev,
        departments: prev.departments.map(d =>
          d.id === selectedDeptId ? { ...d, plazas: d.plazas.filter(p => p.id !== plazaId) } : d
        ),
      }));
    }
  };

  // ============ BACKUP ============
  const handleExportBackup = () => {
    const backupData = {
      version: '3.0.26',
      exportDate: new Date().toISOString(),
      exportedBy: state.currentEmployee.name,
      companyData: state.companyData,
      data: {
        employees: state.employees,
        requests: state.requests,
        candidates: state.candidates,
        policies: state.policies,
        trainings: state.trainings,
        departments: state.departments,
        evaluations: state.evaluations,
        notifications: state.notifications,
        events: state.events,
        currentEmployee: state.currentEmployee,
      }
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Talent360_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportStatus('Respaldo exportado exitosamente');
    setTimeout(() => setExportStatus(''), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.data) {
          setState({
            companyData: parsed.companyData || state.companyData,
            employees: parsed.data.employees || state.employees,
            requests: parsed.data.requests || state.requests,
            candidates: parsed.data.candidates || state.candidates,
            policies: parsed.data.policies || state.policies,
            trainings: parsed.data.trainings || state.trainings,
            departments: parsed.data.departments || state.departments,
            evaluations: parsed.data.evaluations || state.evaluations,
            notifications: parsed.data.notifications || state.notifications,
            events: parsed.data.events || state.events,
            currentEmployee: parsed.data.currentEmployee || state.currentEmployee,
          });
          setImportStatus(`Respaldo restaurado (v${parsed.version || 'N/A'})`);
        } else {
          setImportStatus('Error: Formato inválido');
        }
      } catch {
        setImportStatus('Error al leer el archivo');
      }
      setTimeout(() => setImportStatus(''), 4000);
    };
    reader.readAsText(file);
  };

  const levelColor = (level: string) => {
    switch (level) {
      case 'Junior': return 'badge-blue';
      case 'Mid': return 'badge-purple';
      case 'Senior': return 'badge-green';
      default: return 'badge-gray';
    }
  };

  const tabs = [
    { id: 'company', label: 'Datos de la Empresa', icon: 'fa-building' },
    { id: 'departments', label: 'Departamentos', icon: 'fa-sitemap' },
    { id: 'plazas', label: 'Plazas / Puestos', icon: 'fa-briefcase' },
    { id: 'backup', label: 'Respaldos', icon: 'fa-database' },
  ];

  return (
    <div className="space-y-6">
      {/* Status */}
      {importStatus && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <i className="fas fa-check-circle text-green-600"></i>
          <span className="text-sm text-green-700">{importStatus}</span>
        </div>
      )}
      {exportStatus && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <i className="fas fa-info-circle text-blue-600"></i>
          <span className="text-sm text-blue-700">{exportStatus}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Departamentos</p>
              <p className="text-2xl font-bold text-blue-700">{state.departments.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-building text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Plazas</p>
              <p className="text-2xl font-bold text-purple-700">{state.departments.reduce((a, d) => a + d.plazas.length, 0)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-briefcase text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Empleados</p>
              <p className="text-2xl font-bold text-green-700">{state.employees.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-users text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Tamaño Datos</p>
              <p className="text-2xl font-bold text-orange-700">{(JSON.stringify(state).length / 1024).toFixed(1)} KB</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-hdd text-orange-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <i className={`fas ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* COMPANY TAB */}
          {activeTab === 'company' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Información Corporativa</h3>
                {!editingCompany ? (
                  <button
                    onClick={() => setEditingCompany(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                  >
                    <i className="fas fa-edit mr-2"></i>Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingCompany(false); setCompanyForm(state.companyData); }}
                      className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveCompany}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                    >
                      <i className="fas fa-save mr-1"></i>Guardar
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nombre Comercial</label>
                  {editingCompany ? (
                    <input
                      type="text"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded">{companyForm.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Razón Social</label>
                  {editingCompany ? (
                    <input
                      type="text"
                      value={companyForm.legalName}
                      onChange={(e) => setCompanyForm({ ...companyForm, legalName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded">{companyForm.legalName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">NIT / NRC</label>
                  {editingCompany ? (
                    <input
                      type="text"
                      value={companyForm.taxId}
                      onChange={(e) => setCompanyForm({ ...companyForm, taxId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded">{companyForm.taxId}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Industria</label>
                  {editingCompany ? (
                    <input
                      type="text"
                      value={companyForm.industry}
                      onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded">{companyForm.industry}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Dirección</label>
                  {editingCompany ? (
                    <input
                      type="text"
                      value={companyForm.address}
                      onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded">{companyForm.address}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Ciudad</label>
                  {editingCompany ? (
                    <input
                      type="text"
                      value={companyForm.city}
                      onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded">{companyForm.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">País</label>
                  {editingCompany ? (
                    <input
                      type="text"
                      value={companyForm.country}
                      onChange={(e) => setCompanyForm({ ...companyForm, country: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded">{companyForm.country}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
                  {editingCompany ? (
                    <input
                      type="text"
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded">{companyForm.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email Corporativo</label>
                  {editingCompany ? (
                    <input
                      type="email"
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded">{companyForm.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Sitio Web</label>
                  {editingCompany ? (
                    <input
                      type="text"
                      value={companyForm.website}
                      onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded">{companyForm.website}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fecha de Fundación</label>
                  {editingCompany ? (
                    <input
                      type="date"
                      value={companyForm.founded}
                      onChange={(e) => setCompanyForm({ ...companyForm, founded: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded">{companyForm.founded}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Total de Empleados (plantilla)</label>
                  {editingCompany ? (
                    <input
                      type="number"
                      value={companyForm.employees}
                      onChange={(e) => setCompanyForm({ ...companyForm, employees: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded">{companyForm.employees}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DEPARTMENTS TAB */}
          {activeTab === 'departments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">Departamentos de la Organización</h3>
                <button
                  onClick={handleAddDept}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium"
                >
                  <i className="fas fa-plus mr-2"></i>Nuevo Departamento
                </button>
              </div>

              {showDeptForm && (
                <form onSubmit={handleSaveDept} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h5 className="font-medium text-slate-700 mb-3">
                    {editingDeptId ? 'Editar Departamento' : 'Nuevo Departamento'}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input required type="text" placeholder="Nombre" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    <input required type="text" placeholder="Gerente / Responsable" value={deptForm.manager} onChange={(e) => setDeptForm({ ...deptForm, manager: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    <textarea required placeholder="Descripción" value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} className="md:col-span-2 px-3 py-2 border border-slate-300 rounded-lg text-sm" rows={2} />
                    <div className="md:col-span-2 flex justify-end gap-2">
                      <button type="button" onClick={() => { setShowDeptForm(false); setEditingDeptId(null); }} className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg text-sm">Cancelar</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                        <i className="fas fa-save mr-1"></i>{editingDeptId ? 'Actualizar' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.departments.map(dept => (
                  <div key={dept.id} className="border border-slate-200 rounded-lg p-4 card-hover">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-building text-blue-600"></i>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{dept.name}</h4>
                          <p className="text-xs text-slate-500">{dept.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditDept(dept)} className="text-blue-600 hover:text-blue-800 p-1"><i className="fas fa-edit text-sm"></i></button>
                        <button onClick={() => handleDeleteDept(dept.id)} className="text-red-500 hover:text-red-700 p-1"><i className="fas fa-trash text-sm"></i></button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-3 line-clamp-2">{dept.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500"><i className="fas fa-user-tie mr-1"></i>{dept.manager}</span>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded">
                          {state.employees.filter(e => e.departmentId === dept.id).length} empleados
                        </span>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
                          {dept.plazas.length} plazas
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PLAZAS TAB */}
          {activeTab === 'plazas' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => { setSelectedDeptId(e.target.value); setShowPlazaForm(false); }}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm min-w-[250px]"
                  >
                    {state.departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.plazas.length} plazas)</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddPlaza}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium"
                >
                  <i className="fas fa-plus mr-2"></i>Nueva Plaza
                </button>
              </div>

              {selectedDept && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-info-circle text-blue-600"></i>
                    <div>
                      <p className="text-sm font-medium text-blue-800">{selectedDept.name}</p>
                      <p className="text-xs text-blue-600">{selectedDept.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {showPlazaForm && (
                <form onSubmit={handleSavePlaza} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h5 className="font-medium text-slate-700 mb-3">
                    {editingPlazaId ? 'Editar Plaza' : 'Nueva Plaza'} - {selectedDept?.name}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input required type="text" placeholder="Nombre del puesto" value={plazaForm.name} onChange={(e) => setPlazaForm({ ...plazaForm, name: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    <select value={plazaForm.level} onChange={(e) => setPlazaForm({ ...plazaForm, level: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
                      <option>Junior</option>
                      <option>Mid</option>
                      <option>Senior</option>
                    </select>
                    <input required type="number" min="0" placeholder="Salario Mínimo" value={plazaForm.minSalary} onChange={(e) => setPlazaForm({ ...plazaForm, minSalary: parseInt(e.target.value) || 0 })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    <input required type="number" min="0" placeholder="Salario Máximo" value={plazaForm.maxSalary} onChange={(e) => setPlazaForm({ ...plazaForm, maxSalary: parseInt(e.target.value) || 0 })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    <textarea required placeholder="Descripción" value={plazaForm.description} onChange={(e) => setPlazaForm({ ...plazaForm, description: e.target.value })} className="md:col-span-2 px-3 py-2 border border-slate-300 rounded-lg text-sm" rows={2} />
                    <div className="md:col-span-2 flex justify-end gap-2">
                      <button type="button" onClick={() => { setShowPlazaForm(false); setEditingPlazaId(null); }} className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg text-sm">Cancelar</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                        <i className="fas fa-save mr-1"></i>{editingPlazaId ? 'Actualizar' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {selectedDept && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Plaza</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nivel</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Rango Salarial</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Descripción</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Empleados</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedDept.plazas.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                            <i className="fas fa-briefcase text-3xl mb-2 block"></i>
                            No hay plazas registradas
                          </td>
                        </tr>
                      ) : (
                        selectedDept.plazas.map(plaza => {
                          const empCount = state.employees.filter(e => e.plazaId === plaza.id).length;
                          return (
                            <tr key={plaza.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <p className="text-sm font-medium text-slate-700">{plaza.name}</p>
                                <p className="text-xs text-slate-400">{plaza.id}</p>
                              </td>
                              <td className="px-4 py-3"><span className={`badge ${levelColor(plaza.level)}`}>{plaza.level}</span></td>
                              <td className="px-4 py-3 text-sm text-slate-600">${plaza.minSalary} - ${plaza.maxSalary}</td>
                              <td className="px-4 py-3 text-sm text-slate-500 max-w-[250px] truncate">{plaza.description}</td>
                              <td className="px-4 py-3"><span className="badge badge-blue">{empCount}</span></td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button onClick={() => handleEditPlaza(plaza)} className="text-blue-600 hover:text-blue-800 text-sm"><i className="fas fa-edit"></i></button>
                                  <button onClick={() => handleDeletePlaza(plaza.id)} className="text-red-500 hover:text-red-700 text-sm"><i className="fas fa-trash"></i></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* BACKUP TAB */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-download text-blue-600 text-lg"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Exportar Respaldo</h3>
                      <p className="text-xs text-slate-500">Descargar base de datos completa</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Genera un archivo JSON con todos los datos del sistema: empresa, empleados, departamentos, plazas, solicitudes, candidatos, evaluaciones y más.
                  </p>
                  <button
                    onClick={handleExportBackup}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                  >
                    <i className="fas fa-file-export mr-2"></i>Exportar Respaldo JSON
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-upload text-green-600 text-lg"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Restaurar Respaldo</h3>
                      <p className="text-xs text-slate-500">Importar archivo JSON</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Carga un archivo de respaldo JSON previamente exportado para restaurar el estado completo del sistema.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportBackup}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                  >
                    <i className="fas fa-file-import mr-2"></i>Importar Respaldo JSON
                  </button>
                </div>
              </div>

              <div className="border border-red-200 rounded-lg p-6 bg-red-50/30">
                <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <i className="fas fa-exclamation-triangle"></i>Zona de Peligro
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Estas acciones no se pueden deshacer. Asegúrate de tener un respaldo antes de proceder.
                </p>
                <button
                  onClick={() => {
                    if (confirm('¿Reiniciar todos los datos? Esta acción no se puede deshacer.')) {
                      setState(prev => ({ ...prev, requests: [], candidates: [], evaluations: [] }));
                    }
                  }}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium border border-red-300"
                >
                  <i className="fas fa-trash mr-2"></i>Limpiar Solicitudes y Candidatos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
