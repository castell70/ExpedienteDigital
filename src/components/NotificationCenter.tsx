import { useAppContext } from '../App';

interface Props {
  onClose: () => void;
}

export default function NotificationCenter({ onClose }: Props) {
  const { state, setState } = useAppContext();

  const markAsRead = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
  };

  const markAllAsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
    }));
  };

  const clearAll = () => {
    setState(prev => ({ ...prev, notifications: [] }));
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'info': return { icon: 'fa-info-circle', color: 'text-blue-500 bg-blue-100' };
      case 'success': return { icon: 'fa-check-circle', color: 'text-green-500 bg-green-100' };
      case 'warning': return { icon: 'fa-exclamation-triangle', color: 'text-orange-500 bg-orange-100' };
      case 'error': return { icon: 'fa-times-circle', color: 'text-red-500 bg-red-100' };
      default: return { icon: 'fa-bell', color: 'text-slate-500 bg-slate-100' };
    }
  };

  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose}></div>
      <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <i className="fas fa-bell"></i>
              Centro de Notificaciones
            </h3>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <p className="text-sm text-blue-100">
            {unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : 'Todo al día'}
          </p>
        </div>

        {/* Actions */}
        <div className="p-3 border-b border-slate-100 flex gap-2">
          <button
            onClick={markAllAsRead}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <i className="fas fa-check-double mr-1"></i>Marcar todo leído
          </button>
          <button
            onClick={clearAll}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <i className="fas fa-trash mr-1"></i>Limpiar todo
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {state.notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <i className="fas fa-bell-slash text-4xl mb-3 block"></i>
              <p className="text-sm">No hay notificaciones</p>
            </div>
          ) : (
            state.notifications.map(notif => {
              const { icon, color } = typeIcon(notif.type);
              return (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                    !notif.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                      <i className={`fas ${icon} text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold ${!notif.read ? 'text-slate-800' : 'text-slate-600'}`}>
                          {notif.title}
                          {!notif.read && <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-slate-400">{notif.date}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{notif.module}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
