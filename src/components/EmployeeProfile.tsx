import { useState, useRef } from 'react';
import { useAppContext, Employee, Training } from '../App';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  category: string;
}

export default function EmployeeProfile() {
  const { state, setState } = useAppContext();
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'training'>('info');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(state.currentEmployee.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});

  // Training CRUD
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
  const [trainingForm, setTrainingForm] = useState({
    course: '',
    provider: '',
    date: '',
    hours: 0,
    status: 'Completado' as Training['status'],
  });

  const [documents, setDocuments] = useState<Document[]>([
    { id: 'DOC001', name: 'CV_CarlosCastillo_2026.pdf', type: 'application/pdf', size: '245 KB', date: '2026-01-15', category: 'CV' },
    { id: 'DOC002', name: 'AWS_Certificate.pdf', type: 'application/pdf', size: '1.2 MB', date: '2025-08-20', category: 'Certificación' },
    { id: 'DOC003', name: 'Titulo_Ingenieria.pdf', type: 'application/pdf', size: '3.5 MB', date: '2022-03-10', category: 'Título' },
    { id: 'DOC004', name: 'Diplomado_Gestion_Proyectos.pdf', type: 'application/pdf', size: '890 KB', date: '2024-11-05', category: 'Diploma' },
  ]);

  // Filter employees by search
  const filteredEmployees = state.employees.filter(emp => {
    const term = searchTerm.toLowerCase();
    return (
      emp.name.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.department.toLowerCase().includes(term) ||
      emp.position.toLowerCase().includes(term) ||
      emp.id.toLowerCase().includes(term) ||
      emp.skills.some(s => s.toLowerCase().includes(term))
    );
  });

  const employee = state.employees.find(e => e.id === selectedEmployeeId) || state.currentEmployee;
  const employeeTrainings = state.trainings.filter(t => t.employeeId === selectedEmployeeId);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const newDocs: Document[] = Array.from(files).map((file, idx) => ({
      id: `DOC${Date.now()}${idx}`,
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(0)} KB`,
      date: new Date().toISOString().split('T')[0],
      category: 'Documento',
    }));
    setDocuments(prev => [...prev, ...newDocs]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // Edit employee
  const startEdit = () => {
    setEditForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      departmentId: employee.departmentId,
      position: employee.position,
      plazaId: employee.plazaId,
      skills: [...employee.skills],
      certifications: [...employee.certifications],
      status: employee.status,
    });
    setIsEditing(true);
  };

  const saveEdit = () => {
    setState(prev => ({
      ...prev,
      employees: prev.employees.map(e =>
        e.id === selectedEmployeeId ? { ...e, ...editForm } : e
      ),
      currentEmployee: selectedEmployeeId === prev.currentEmployee.id
        ? { ...prev.currentEmployee, ...editForm }
        : prev.currentEmployee,
    }));
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  // Training CRUD
  const handleAddTraining = () => {
    setTrainingForm({ course: '', provider: '', date: '', hours: 0, status: 'Completado' });
    setEditingTrainingId(null);
    setShowTrainingForm(true);
  };

  const handleEditTraining = (training: Training) => {
    setTrainingForm({
      course: training.course,
      provider: training.provider,
      date: training.date,
      hours: training.hours,
      status: training.status,
    });
    setEditingTrainingId(training.id);
    setShowTrainingForm(true);
  };

  const handleSaveTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTrainingId) {
      // Update
      setState(prev => ({
        ...prev,
        trainings: prev.trainings.map(t =>
          t.id === editingTrainingId
            ? { ...t, ...trainingForm }
            : t
        ),
      }));
    } else {
      // Create
      const newTraining: Training = {
        id: `TR${Date.now()}`,
        employeeId: selectedEmployeeId,
        course: trainingForm.course,
        provider: trainingForm.provider,
        date: trainingForm.date,
        hours: trainingForm.hours,
        status: trainingForm.status,
      };
      setState(prev => ({
        ...prev,
        trainings: [...prev.trainings, newTraining],
      }));
    }
    setShowTrainingForm(false);
    setEditingTrainingId(null);
    setTrainingForm({ course: '', provider: '', date: '', hours: 0, status: 'Completado' });
  };

  const handleDeleteTraining = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta capacitación?')) {
      setState(prev => ({
        ...prev,
        trainings: prev.trainings.filter(t => t.id !== id),
      }));
    }
  };

  // Skills editing
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && editForm.skills && !editForm.skills.includes(newSkill.trim())) {
      setEditForm({ ...editForm, skills: [...editForm.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    if (editForm.skills) {
      setEditForm({ ...editForm, skills: editForm.skills.filter(s => s !== skill) });
    }
  };

  const addCert = () => {
    if (newCert.trim() && editForm.certifications && !editForm.certifications.includes(newCert.trim())) {
      setEditForm({ ...editForm, certifications: [...editForm.certifications, newCert.trim()] });
      setNewCert('');
    }
  };

  const removeCert = (cert: string) => {
    if (editForm.certifications) {
      setEditForm({ ...editForm, certifications: editForm.certifications.filter(c => c !== cert) });
    }
  };

  return (
    <div className="space-y-6">
      {/* Employee Selector & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <i className="fas fa-search text-blue-500 mr-1"></i>
              Buscar Empleado (nombre, email, departamento, puesto, habilidades, ID)
            </label>
            <input
              type="text"
              placeholder="Ej: Carlos, Tecnología, JavaScript, EMP001..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:w-72">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <i className="fas fa-user text-blue-500 mr-1"></i>
              Seleccionar Empleado
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => { setSelectedEmployeeId(e.target.value); setIsEditing(false); }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {state.employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Results */}
        {searchTerm && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500 mb-2">Resultados ({filteredEmployees.length}):</p>
            <div className="flex flex-wrap gap-2">
              {filteredEmployees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => { setSelectedEmployeeId(emp.id); setSearchTerm(''); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    emp.id === selectedEmployeeId
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  {emp.name.split(' ').slice(0, 2).join(' ')} • {emp.department}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800"></div>
        <div className="px-6 pb-6 -mt-12">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 bg-white rounded-xl shadow-md flex items-center justify-center border-4 border-white">
              <span className="text-3xl font-bold text-blue-700">
                {employee.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </span>
            </div>
            <div className="flex-1 pb-2">
              <h2 className="text-2xl font-bold text-gray-800">{employee.name}</h2>
              <p className="text-gray-500">{employee.position} • {employee.department}</p>
            </div>
            <div className="flex gap-2 pb-2">
              <span className="badge badge-blue">Activo</span>
              <span className="badge badge-green">ID: {employee.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-100">
          {[
            { id: 'info', label: 'Información Personal', icon: 'fa-id-card' },
            { id: 'documents', label: 'Documentos', icon: 'fa-folder-open' },
            { id: 'training', label: 'Capacitaciones', icon: 'fa-graduation-cap' },
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
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Edit/View Toggle */}
              <div className="flex justify-end">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg text-sm font-medium"
                    >
                      <i className="fas fa-times mr-2"></i>Cancelar
                    </button>
                    <button
                      onClick={saveEdit}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                    >
                      <i className="fas fa-save mr-2"></i>Guardar Cambios
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startEdit}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                  >
                    <i className="fas fa-edit mr-2"></i>Editar Expediente
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <i className="fas fa-user text-blue-600"></i> Datos Personales
                  </h3>
                  {isEditing ? (
                    <>
                      <EditField label="Nombre Completo" value={editForm.name || ''} onChange={(v) => setEditForm({ ...editForm, name: v })} />
                      <EditField label="Correo Electrónico" value={editForm.email || ''} onChange={(v) => setEditForm({ ...editForm, email: v })} type="email" />
                      <EditField label="Teléfono" value={editForm.phone || ''} onChange={(v) => setEditForm({ ...editForm, phone: v })} />
                      <InfoRow label="Fecha de Ingreso" value={employee.startDate} />
                    </>
                  ) : (
                    <>
                      <InfoRow label="Nombre Completo" value={employee.name} />
                      <InfoRow label="Correo Electrónico" value={employee.email} />
                      <InfoRow label="Teléfono" value={employee.phone} />
                      <InfoRow label="Fecha de Ingreso" value={employee.startDate} />
                    </>
                  )}
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <i className="fas fa-briefcase text-blue-600"></i> Datos Corporativos
                  </h3>
                  {isEditing ? (
                    <>
                      <div className="py-2 border-b border-gray-50">
                        <label className="block text-xs text-gray-500 mb-1">Departamento</label>
                        <select
                          value={editForm.departmentId || ''}
                          onChange={(e) => {
                            const dept = state.departments.find(d => d.id === e.target.value);
                            setEditForm({ ...editForm, departmentId: e.target.value, department: dept?.name || '' });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          {state.departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="py-2 border-b border-gray-50">
                        <label className="block text-xs text-gray-500 mb-1">Plaza / Puesto</label>
                        <select
                          value={editForm.plazaId || ''}
                          onChange={(e) => {
                            const dept = state.departments.find(d => d.id === editForm.departmentId);
                            const plaza = dept?.plazas.find(p => p.id === e.target.value);
                            setEditForm({ ...editForm, plazaId: e.target.value, position: plaza?.name || '' });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          disabled={!editForm.departmentId}
                        >
                          <option value="">Seleccionar plaza...</option>
                          {state.departments.find(d => d.id === editForm.departmentId)?.plazas.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.level})</option>
                          ))}
                        </select>
                      </div>
                      <div className="py-2 border-b border-gray-50">
                        <label className="block text-xs text-gray-500 mb-1">Estado</label>
                        <select
                          value={editForm.status || 'Activo'}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                          <option value="Vacaciones">Vacaciones</option>
                          <option value="Licencia">Licencia</option>
                        </select>
                      </div>
                      <InfoRow label="ID Empleado" value={employee.id} />
                      <InfoRow label="Antigüedad" value={`${Math.floor((Date.now() - new Date(employee.startDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} años`} />
                    </>
                  ) : (
                    <>
                      <InfoRow label="Departamento" value={employee.department} />
                      <InfoRow label="Plaza / Puesto" value={employee.position} />
                      <InfoRow label="Estado" value={employee.status} />
                      <InfoRow label="ID Empleado" value={employee.id} />
                      <InfoRow label="Antigüedad" value={`${Math.floor((Date.now() - new Date(employee.startDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} años`} />
                    </>
                  )}
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fas fa-star text-orange-500"></i> Competencias y Habilidades
                  </h3>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {(editForm.skills || []).map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1.5">
                            {skill}
                            <button onClick={() => removeSkill(skill)} className="text-blue-400 hover:text-red-500">
                              <i className="fas fa-times text-xs"></i>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          placeholder="Nueva habilidad..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button onClick={addSkill} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {employee.skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fas fa-certificate text-green-600"></i> Certificaciones
                  </h3>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {(editForm.certifications || []).map((cert, i) => (
                          <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium flex items-center gap-1.5">
                            <i className="fas fa-award"></i> {cert}
                            <button onClick={() => removeCert(cert)} className="text-green-400 hover:text-red-500">
                              <i className="fas fa-times text-xs"></i>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCert}
                          onChange={(e) => setNewCert(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
                          placeholder="Nueva certificación..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button onClick={addCert} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {employee.certifications.map((cert, i) => (
                        <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium flex items-center gap-1.5">
                          <i className="fas fa-award"></i> {cert}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* Drop Zone */}
              <div
                className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <i className="fas fa-cloud-upload-alt text-4xl text-blue-400 mb-3"></i>
                <p className="text-gray-600 font-medium">Arrastra archivos aquí o haz clic para seleccionar</p>
                <p className="text-sm text-gray-400 mt-1">PDF, PNG, JPG (máx. 10MB por archivo)</p>
              </div>

              {/* Documents Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Documento</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Categoría</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tamaño</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {documents.map(doc => (
                      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <i className="fas fa-file-pdf text-red-500 text-lg"></i>
                            <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="badge badge-blue">{doc.category}</span></td>
                        <td className="px-4 py-3 text-sm text-gray-500">{doc.size}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{doc.date}</td>
                        <td className="px-4 py-3">
                          <button className="text-blue-600 hover:text-blue-800 text-sm mr-3">
                            <i className="fas fa-eye"></i> Ver
                          </button>
                          <button
                            onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'training' && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700">{employeeTrainings.filter(t => t.status === 'Completado').length}</p>
                  <p className="text-sm text-blue-600">Cursos Completados</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-700">{employeeTrainings.reduce((a, t) => a + t.hours, 0)}</p>
                  <p className="text-sm text-orange-600">Horas Totales</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-700">{employeeTrainings.filter(t => t.status === 'En Progreso').length}</p>
                  <p className="text-sm text-green-600">En Progreso</p>
                </div>
              </div>

              {/* Add Training Button */}
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-700">
                  <i className="fas fa-list text-blue-600 mr-2"></i>
                  Historial de Capacitaciones
                </h4>
                <button
                  onClick={handleAddTraining}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>Agregar Capacitación
                </button>
              </div>

              {/* Training Form */}
              {showTrainingForm && (
                <form onSubmit={handleSaveTraining} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h5 className="font-medium text-gray-700 mb-3">
                    {editingTrainingId ? 'Editar Capacitación' : 'Nueva Capacitación'}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Curso / Capacitación</label>
                      <input
                        required
                        type="text"
                        value={trainingForm.course}
                        onChange={(e) => setTrainingForm({ ...trainingForm, course: e.target.value })}
                        placeholder="Nombre del curso"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Proveedor / Institución</label>
                      <input
                        required
                        type="text"
                        value={trainingForm.provider}
                        onChange={(e) => setTrainingForm({ ...trainingForm, provider: e.target.value })}
                        placeholder="Ej: Coursera, Udemy, LinkedIn Learning"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                      <input
                        required
                        type="date"
                        value={trainingForm.date}
                        onChange={(e) => setTrainingForm({ ...trainingForm, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Horas</label>
                      <input
                        required
                        type="number"
                        min="1"
                        value={trainingForm.hours}
                        onChange={(e) => setTrainingForm({ ...trainingForm, hours: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                      <select
                        value={trainingForm.status}
                        onChange={(e) => setTrainingForm({ ...trainingForm, status: e.target.value as Training['status'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Completado">Completado</option>
                        <option value="En Progreso">En Progreso</option>
                        <option value="Pendiente">Pendiente</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                      >
                        <i className="fas fa-save mr-1"></i>
                        {editingTrainingId ? 'Actualizar' : 'Guardar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowTrainingForm(false); setEditingTrainingId(null); }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Training Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Curso</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Proveedor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Horas</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {employeeTrainings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                          <i className="fas fa-graduation-cap text-3xl mb-2 block"></i>
                          No hay capacitaciones registradas para este empleado
                        </td>
                      </tr>
                    ) : (
                      employeeTrainings.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-700">{t.course}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{t.provider}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{t.date}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{t.hours}h</td>
                          <td className="px-4 py-3">
                            <span className={`badge ${t.status === 'Completado' ? 'badge-green' : t.status === 'En Progreso' ? 'badge-yellow' : 'badge-gray'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditTraining(t)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                                title="Editar"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                onClick={() => handleDeleteTraining(t.id)}
                                className="text-red-500 hover:text-red-700 text-sm"
                                title="Eliminar"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}

function EditField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="py-2 border-b border-gray-50">
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}
