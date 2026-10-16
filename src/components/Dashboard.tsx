import { useAppContext } from '../App';

export default function Dashboard() {
  const { state } = useAppContext();

  // KPIs
  const totalEmployees = state.employees.length;
  const activeEmployees = state.employees.filter(e => e.status === 'Activo').length;
  const pendingRequests = state.requests.filter(r => r.status === 'Pendiente').length;
  const approvedRequests = state.requests.filter(r => r.status === 'Aprobado').length;
  const activeCandidates = state.candidates.filter(c => c.status === 'En Revisión' || c.status === 'Entrevista').length;
  const hiredCandidates = state.candidates.filter(c => c.status === 'Contratado').length;
  const policiesConfirmed = state.policies.filter(p => p.confirmed).length;
  const completedEvals = state.evaluations.filter(e => e.status === 'Completada');
  const avgScore = completedEvals.length > 0
    ? Math.round(completedEvals.reduce((a, e) => a + e.score, 0) / completedEvals.length)
    : 0;

  // Department distribution
  const deptData = state.departments.map(d => ({
    name: d.name,
    employees: state.employees.filter(e => e.departmentId === d.id).length,
    plazas: d.plazas.length,
  }));
  const maxDeptCount = Math.max(...deptData.map(d => d.employees), 1);

  // Upcoming events
  const upcomingEvents = [...state.events]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  // Recent activity
  const recentRequests = [...state.requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  const eventTypeIcon = (type: string) => {
    switch (type) {
      case 'cumpleanos': return { icon: 'fa-birthday-cake', color: 'bg-pink-100 text-pink-600' };
      case 'aniversario': return { icon: 'fa-award', color: 'bg-yellow-100 text-yellow-600' };
      case 'capacitacion': return { icon: 'fa-graduation-cap', color: 'bg-blue-100 text-blue-600' };
      case 'reunion': return { icon: 'fa-users', color: 'bg-purple-100 text-purple-600' };
      default: return { icon: 'fa-calendar', color: 'bg-slate-100 text-slate-600' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Bienvenido de vuelta</p>
            <h2 className="text-2xl font-bold mt-1">{state.currentEmployee.name.split(' ').slice(0, 2).join(' ')}</h2>
            <p className="text-blue-100 text-sm mt-1">
              {new Date().toLocaleDateString('es-SV', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-blue-100 text-xs mt-2">
              <i className="fas fa-building mr-1"></i>
              {state.companyData.name} • {state.companyData.city}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-blue-100">Puntuación Promedio</p>
              <p className="text-3xl font-bold">{avgScore}</p>
              <p className="text-xs text-blue-200">Evaluaciones</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fas fa-chart-line text-3xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Empleados Activos"
          value={activeEmployees}
          total={totalEmployees}
          icon="fa-users"
          color="blue"
          trend="+2 este mes"
        />
        <KPICard
          title="Solicitudes Pendientes"
          value={pendingRequests}
          total={state.requests.length}
          icon="fa-clock"
          color="orange"
          trend={`${approvedRequests} aprobadas`}
        />
        <KPICard
          title="Candidatos Activos"
          value={activeCandidates}
          total={state.candidates.length}
          icon="fa-user-plus"
          color="purple"
          trend={`${hiredCandidates} contratados`}
        />
        <KPICard
          title="Políticas Confirmadas"
          value={policiesConfirmed}
          total={state.policies.length}
          icon="fa-check-double"
          color="green"
          trend={`${state.policies.length - policiesConfirmed} pendientes`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <i className="fas fa-building text-blue-600"></i>
              Distribución por Departamento
            </h3>
            <span className="text-xs text-slate-500">{state.departments.length} áreas</span>
          </div>
          <div className="space-y-3">
            {deptData.map((dept, i) => {
              const colors = ['from-blue-500 to-blue-600', 'from-purple-500 to-purple-600', 'from-green-500 to-green-600', 'from-orange-500 to-orange-600', 'from-pink-500 to-pink-600'];
              return (
                <div key={dept.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors[i % colors.length]}`}></div>
                      <span className="text-sm font-medium text-slate-700">{dept.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{dept.plazas} plazas</span>
                      <span className="text-sm font-bold text-slate-800">{dept.employees}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className={`bg-gradient-to-r ${colors[i % colors.length]} h-2.5 rounded-full transition-all duration-700`}
                      style={{ width: `${(dept.employees / maxDeptCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fas fa-calendar-alt text-purple-600"></i>
            Próximos Eventos
          </h3>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No hay eventos próximos</p>
            ) : (
              upcomingEvents.map(ev => {
                const { icon, color } = eventTypeIcon(ev.type);
                return (
                  <div key={ev.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                      <i className={`fas ${icon} text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{ev.title}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(ev.date).toLocaleDateString('es-SV', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fas fa-history text-blue-600"></i>
            Solicitudes Recientes
          </h3>
          <div className="space-y-3">
            {recentRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{req.employeeName.split(' ').slice(0, 2).join(' ')}</p>
                  <p className="text-xs text-slate-400">{req.type} • {req.createdAt}</p>
                </div>
                <span className={`badge ${req.status === 'Aprobado' ? 'badge-green' : req.status === 'Pendiente' ? 'badge-yellow' : 'badge-red'}`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate Pipeline */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fas fa-funnel-dollar text-purple-600"></i>
            Pipeline de Candidatos
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'En Revisión', count: state.candidates.filter(c => c.status === 'En Revisión').length, color: 'yellow' },
              { label: 'Entrevista', count: state.candidates.filter(c => c.status === 'Entrevista').length, color: 'blue' },
              { label: 'Contratado', count: state.candidates.filter(c => c.status === 'Contratado').length, color: 'green' },
              { label: 'Descartado', count: state.candidates.filter(c => c.status === 'Descartado').length, color: 'red' },
            ].map(item => (
              <div key={item.label} className={`bg-${item.color}-50 border border-${item.color}-200 rounded-lg p-3`}>
                <p className="text-xs text-slate-600">{item.label}</p>
                <p className={`text-2xl font-bold text-${item.color}-700`}>{item.count}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Tasa de contratación:</span>
              <span className="font-bold text-green-700">
                {state.candidates.length > 0 ? Math.round((hiredCandidates / state.candidates.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fas fa-chart-pie text-orange-600"></i>
            Indicadores Clave
          </h3>
          <div className="space-y-3">
            <QuickStat label="Horas de Capacitación" value={`${state.trainings.reduce((a, t) => a + t.hours, 0)}h`} icon="fa-graduation-cap" color="blue" />
            <QuickStat label="Certificaciones" value={state.employees.reduce((a, e) => a + e.certifications.length, 0).toString()} icon="fa-certificate" color="green" />
            <QuickStat label="Evaluaciones Completadas" value={completedEvals.length.toString()} icon="fa-clipboard-check" color="purple" />
            <QuickStat label="Notificaciones" value={state.notifications.filter(n => !n.read).length.toString()} icon="fa-bell" color="orange" />
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
          <FooterStat label="Departamentos" value={state.departments.length} />
          <FooterStat label="Plazas" value={state.departments.reduce((a, d) => a + d.plazas.length, 0)} />
          <FooterStat label="Empleados" value={state.employees.length} />
          <FooterStat label="Solicitudes" value={state.requests.length} />
          <FooterStat label="Candidatos" value={state.candidates.length} />
          <FooterStat label="Evaluaciones" value={state.evaluations.length} />
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, total, icon, color, trend }: { title: string; value: number; total: number; icon: string; color: string; trend: string }) {
  const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
    blue: { bg: 'bg-blue-100', icon: 'text-blue-600', text: 'text-blue-700' },
    orange: { bg: 'bg-orange-100', icon: 'text-orange-600', text: 'text-orange-700' },
    purple: { bg: 'bg-purple-100', icon: 'text-purple-600', text: 'text-purple-700' },
    green: { bg: 'bg-green-100', icon: 'text-green-600', text: 'text-green-700' },
  };
  const c = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className={`text-3xl font-bold ${c.text}`}>{value}</p>
            <p className="text-xs text-slate-400">/ {total}</p>
          </div>
          <p className="text-xs text-slate-400 mt-1">{trend}</p>
        </div>
        <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center`}>
          <i className={`fas ${icon} ${c.icon} text-xl`}></i>
        </div>
      </div>
    </div>
  );
}

function QuickStat({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <i className={`fas ${icon} text-sm`}></i>
        </div>
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className="font-bold text-slate-800">{value}</span>
    </div>
  );
}

function FooterStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
