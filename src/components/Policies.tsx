import { useState } from 'react';
import { useAppContext } from '../App';

export default function Policies() {
  const { state, setState } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [openArticles, setOpenArticles] = useState<Record<string, boolean>>({});
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  const toggleArticle = (key: string) => {
    setOpenArticles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const confirmReading = (policyId: string) => {
    setState(prev => ({
      ...prev,
      policies: prev.policies.map(p =>
        p.id === policyId ? { ...p, confirmed: true } : p
      )
    }));
  };

  const filteredPolicies = state.policies.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.articles.some(a =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case 'Normativo': return 'fa-gavel';
      case 'Ética': return 'fa-balance-scale';
      case 'Prestaciones': return 'fa-hand-holding-heart';
      default: return 'fa-file-alt';
    }
  };

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'Normativo': return 'bg-blue-100 text-blue-700';
      case 'Ética': return 'bg-purple-100 text-purple-700';
      case 'Prestaciones': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Documentos Totales</p>
              <p className="text-2xl font-bold text-blue-700">{state.policies.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-book text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Artículos Totales</p>
              <p className="text-2xl font-bold text-purple-700">{state.policies.reduce((a, p) => a + p.articles.length, 0)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-list-alt text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Conformidades</p>
              <p className="text-2xl font-bold text-green-700">{state.policies.filter(p => p.confirmed).length}/{state.policies.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-check-double text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="relative max-w-md">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Buscar en políticas, artículos o palabras clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Policies List */}
      <div className="space-y-4">
        {filteredPolicies.map(policy => (
          <div key={policy.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Policy Header */}
            <div
              className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedPolicy(selectedPolicy === policy.id ? null : policy.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColor(policy.category)}`}>
                    <i className={`fas ${categoryIcon(policy.category)}`}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{policy.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`badge ${categoryColor(policy.category)}`}>{policy.category}</span>
                      <span className="text-xs text-gray-400">{policy.articles.length} artículos</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {policy.confirmed ? (
                    <span className="badge badge-green">
                      <i className="fas fa-check mr-1"></i> Conformidad Confirmada
                    </span>
                  ) : (
                    <span className="badge badge-yellow">
                      <i className="fas fa-exclamation mr-1"></i> Pendiente de lectura
                    </span>
                  )}
                  <i className={`fas fa-chevron-${selectedPolicy === policy.id ? 'up' : 'down'} text-gray-400`}></i>
                </div>
              </div>
            </div>

            {/* Policy Content */}
            {selectedPolicy === policy.id && (
              <div className="border-t border-gray-100">
                <div className="p-5 bg-gray-50 border-b border-gray-100">
                  <p className="text-sm text-gray-600 italic">{policy.content}</p>
                </div>

                {/* Articles Accordion */}
                <div className="divide-y divide-gray-100">
                  {policy.articles.map((article, idx) => {
                    const key = `${policy.id}-${idx}`;
                    const isOpen = openArticles[key];
                    return (
                      <div key={idx}>
                        <button
                          onClick={() => toggleArticle(key)}
                          className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-700">{article.title}</span>
                          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-gray-400 text-xs`}></i>
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4">
                            <p className="text-sm text-gray-600 leading-relaxed bg-white rounded-lg p-4 border border-gray-100">
                              {article.content}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Confirm Reading */}
                {!policy.confirmed && (
                  <div className="p-5 bg-orange-50 border-t border-orange-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-exclamation-triangle text-orange-500"></i>
                        <p className="text-sm text-orange-700">
                          Debes confirmar que has leído y comprendido este documento.
                        </p>
                      </div>
                      <button
                        onClick={() => confirmReading(policy.id)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <i className="fas fa-check mr-2"></i>Confirmar Lectura
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
