import { useState } from 'react';

export default function Help() {
  const [activeSection, setActiveSection] = useState<string>('functions');

  const sections = [
    { id: 'functions', label: 'Funciones Clave', icon: 'fa-cogs' },
    { id: 'importexport', label: 'Importación/Exportación', icon: 'fa-exchange-alt' },
    { id: 'legal', label: 'Aspectos Legales', icon: 'fa-gavel' },
    { id: 'privacy', label: 'Privacidad', icon: 'fa-shield-alt' },
    { id: 'terms', label: 'Términos de Servicio', icon: 'fa-file-contract' },
    { id: 'copyright', label: 'Derechos de Autor', icon: 'fa-copyright' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <i className="fas fa-question-circle text-2xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Centro de Ayuda</h2>
            <p className="text-blue-100 text-sm mt-1">Guía completa del sistema Talent360 Hub</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-0">
            <nav className="space-y-1">
              {sections.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeSection === sec.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <i className={`fas ${sec.icon} w-4 text-center`}></i>
                  {sec.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {activeSection === 'functions' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <i className="fas fa-cogs text-blue-600"></i> Funciones Clave del Sistema
                </h3>

                <div className="space-y-4">
                  <FunctionCard
                    title="Expediente Digital del Empleado"
                    description="Perfil 360° completo con datos personales, corporativos, visor de documentos (CV, certificaciones, diplomas), historial de capacitaciones y competencias clave. Soporte para arrastrar y soltar archivos PDF/imágenes."
                    icon="fa-user-circle"
                    color="blue"
                  />
                  <FunctionCard
                    title="Servicios Internos (Self-Service)"
                    description="Formulario de solicitudes para vacaciones, permisos personales/médicos, licencias especiales. Flujo de aprobación con estados visuales (Pendiente, Aprobado, Rechazado). Historial y contador de días disponibles."
                    icon="fa-file-alt"
                    color="orange"
                  />
                  <FunctionCard
                    title="Reclutamiento y Talento"
                    description="Búsqueda inteligente de talento interno con filtros por habilidades, certificación o departamento. Banco de candidatos externos con estados de reclutamiento. Carga masiva desde archivos CSV."
                    icon="fa-users"
                    color="purple"
                  />
                  <FunctionCard
                    title="Portal de Políticas"
                    description="Centro de documentación corporativa con reglamento interno, código de ética y políticas. Visor interactivo tipo acordeón con búsqueda de artículos. Indicador de lectura y conformidad confirmada."
                    icon="fa-book"
                    color="green"
                  />
                  <FunctionCard
                    title="Evaluaciones de Desempeño"
                    description="Sistema completo de evaluación con tipos: Desempeño, 360°, Objetivos y Competencias. Permite registrar fortalezas, áreas de mejora, objetivos y puntuaciones. Seguimiento del progreso y métricas clave."
                    icon="fa-star-half-alt"
                    color="purple"
                  />
                  <FunctionCard
                    title="Reportes y Análisis"
                    description="Centro de reportes con gráficos SVG interactivos (pie charts, bar charts). Exportación a JSON, CSV y PDF. Reportes por módulo: empleados, solicitudes, reclutamiento, evaluaciones y capacitaciones."
                    icon="fa-chart-bar"
                    color="blue"
                  />
                  <FunctionCard
                    title="Administración Integral"
                    description="Datos de la empresa (razón social, NIT, dirección). Gestión de departamentos y plazas/puestos. Respaldos y restauración del sistema completo. Configuración corporativa."
                    icon="fa-cogs"
                    color="indigo"
                  />
                </div>
              </div>
            )}

            {activeSection === 'importexport' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <i className="fas fa-exchange-alt text-blue-600"></i> Guía de Importación y Exportación
                </h3>

                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <i className="fas fa-file-code"></i> Exportación/Importación JSON
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check-circle mt-0.5 text-blue-500"></i>
                        <span><strong>Respaldo Completo:</strong> Exporta toda la base de datos del sistema en un archivo JSON estructurado que incluye empleados, solicitudes, candidatos y políticas.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check-circle mt-0.5 text-blue-500"></i>
                        <span><strong>Restauración:</strong> Importa un archivo JSON de respaldo previamente generado para restaurar el estado completo de la aplicación.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check-circle mt-0.5 text-blue-500"></i>
                        <span><strong>Exportación por Módulo:</strong> Genera archivos JSON individuales para cada módulo (empleados, solicitudes, candidatos).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check-circle mt-0.5 text-blue-500"></i>
                        <span><strong>Formato:</strong> JSON con indentación legible, incluye metadatos de versión, fecha de exportación y usuario.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <i className="fas fa-file-csv"></i> Importación/Exportación CSV
                    </h4>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check-circle mt-0.5 text-green-500"></i>
                        <span><strong>Carga Masiva CSV:</strong> Importa candidatos o empleados desde archivos CSV con columnas estandarizadas.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check-circle mt-0.5 text-green-500"></i>
                        <span><strong>Previsualización:</strong> Antes de confirmar la importación, se muestra una tabla con los datos parseados para verificación.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check-circle mt-0.5 text-green-500"></i>
                        <span><strong>Formato CSV esperado:</strong> Columnas: name, email, phone, position, skills (separadas por ;).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="fas fa-check-circle mt-0.5 text-green-500"></i>
                        <span><strong>Exportación CSV:</strong> Genera archivos CSV compatibles con Excel y otras herramientas de hojas de cálculo.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                    <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                      <i className="fas fa-exclamation-triangle"></i> Consideraciones Importantes
                    </h4>
                    <ul className="space-y-2 text-sm text-amber-700">
                      <li>• Al restaurar un respaldo, los datos actuales serán reemplazados completamente.</li>
                      <li>• Se recomienda generar un respaldo antes de realizar cualquier restauración.</li>
                      <li>• Los archivos CSV deben estar codificados en UTF-8 para caracteres especiales.</li>
                      <li>• El tamaño máximo recomendado para archivos de importación es de 5MB.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'legal' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <i className="fas fa-gavel text-blue-600"></i> Aspectos Legales
                </h3>

                <div className="prose prose-sm max-w-none space-y-4">
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Cumplimiento Normativo</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Talent360 Hub cumple con las disposiciones de la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong> de México, así como con las disposiciones aplicables de la <strong>Ley Federal del Trabajo</strong> en materia de gestión de expedientes de empleados.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Obligaciones del Usuario</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Utilizar la herramienta exclusivamente para fines de gestión de recursos humanos autorizados.</li>
                      <li>• Garantizar la veracidad de la información ingresada al sistema.</li>
                      <li>• Mantener la confidencialidad de las credenciales de acceso.</li>
                      <li>• No compartir, distribuir o divulgar información personal de empleados sin autorización.</li>
                      <li>• Cumplir con las políticas internas de la organización respecto al manejo de datos.</li>
                      <li>• Reportar cualquier incidente de seguridad o acceso no autorizado de manera inmediata.</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Responsabilidades</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      El usuario es responsable de la información que ingresa al sistema y de las acciones que realiza dentro de la plataforma. El sistema registra un log de actividades para fines de auditoría y trazabilidad. Cualquier uso indebido será sujeto a las sanciones establecidas en el reglamento interno de la organización y, en su caso, a las acciones legales correspondientes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <i className="fas fa-shield-alt text-blue-600"></i> Política de Privacidad
                </h3>

                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                    <h4 className="font-semibold text-blue-800 mb-2">Protección de Datos Personales</h4>
                    <p className="text-sm text-blue-700">
                      Talent360 Hub implementa medidas de seguridad técnicas, administrativas y físicas para proteger los datos personales de los usuarios contra daño, pérdida, alteración, destrucción, uso, acceso o apropiación indebida.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <PrivacyItem
                      title="Datos Recopilados"
                      items={[
                        'Datos de identificación personal (nombre, email, teléfono)',
                        'Datos laborales (puesto, departamento, fecha de ingreso)',
                        'Datos de capacitación y desarrollo profesional',
                        'Documentos adjuntos (CV, certificaciones, diplomas)',
                      ]}
                    />
                    <PrivacyItem
                      title="Finalidad del Tratamiento"
                      items={[
                        'Gestión integral de recursos humanos',
                        'Administración de solicitudes y permisos',
                        'Procesos de reclutamiento y selección',
                        'Cumplimiento de obligaciones legales laborales',
                      ]}
                    />
                    <PrivacyItem
                      title="Derechos ARCO"
                      items={[
                        'Acceso: Conocer qué datos personales se tienen sobre usted',
                        'Rectificación: Solicitar la corrección de datos inexactos',
                        'Cancelación: Solicitar la eliminación de datos cuando considere innecesarios',
                        'Oposición: Oponerse al uso de sus datos para fines específicos',
                      ]}
                    />
                    <PrivacyItem
                      title="Medidas de Seguridad"
                      items={[
                        'Almacenamiento local de datos (sin transmisión a servidores externos)',
                        'Cifrado de información sensible en el navegador',
                        'Control de acceso basado en roles',
                        'Registro de auditoría de actividades',
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'terms' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <i className="fas fa-file-contract text-blue-600"></i> Términos de Servicio
                </h3>

                <div className="space-y-4 text-sm text-gray-600">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-semibold text-gray-800 mb-1">1. Aceptación de Términos</h4>
                    <p>Al acceder y utilizar Talent360 Hub, usted acepta estar sujeto a estos términos de servicio, todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes locales aplicables.</p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-semibold text-gray-800 mb-1">2. Licencia de Uso</h4>
                    <p>Se otorga permiso para utilizar Talent360 Hub de forma limitada, personal y no comercial dentro de la organización autorizada. Esta licencia no incluye: modificar o copiar los materiales; usar los materiales para cualquier propósito comercial o para exhibición pública; intentar descompilar o revertir la ingeniería del software.</p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-semibold text-gray-800 mb-1">3. Limitaciones</h4>
                    <p>En ningún caso Talent360 Hub o sus proveedores serán responsables por daños (incluyendo, sin limitación, daños por pérdida de datos o beneficios, o por interrupción del negocio) derivados del uso o la imposibilidad de usar los materiales en Talent360 Hub.</p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-semibold text-gray-800 mb-1">4. Precisión de los Materiales</h4>
                    <p>Los materiales que aparecen en Talent360 Hub podrían incluir errores técnicos, tipográficos o fotográficos. No se garantizan garantías con respecto al uso de los materiales en sus sitios web.</p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-semibold text-gray-800 mb-1">5. Modificaciones</h4>
                    <p>Talent360 Hub puede revisar estos términos de servicio para su sitio web en cualquier momento sin previo aviso. Al utilizar este sitio web, usted acepta quedar vinculado por la versión actual de estos términos de servicio.</p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4 py-2">
                    <h4 className="font-semibold text-gray-800 mb-1">6. Ley Aplicable</h4>
                    <p>Estos términos y condiciones se rigen por las leyes de los Estados Unidos Mexicanos y usted se somete irrevocablemente a la jurisdicción exclusiva de los tribunales competentes en dicha ubicación.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'copyright' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <i className="fas fa-copyright text-blue-600"></i> Derechos de Autor
                </h3>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-copyright text-blue-700 text-3xl"></i>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Talent360 Hub</h4>
                  <p className="text-gray-600 mb-4">Sistema Integral de Gestión de Personal, Talento y RRHH</p>
                  <div className="border-t border-blue-200 pt-4 mt-4">
                    <p className="text-lg font-semibold text-blue-800">
                      © 2026 Carlos Alfredo Castillo Flores
                    </p>
                    <p className="text-blue-600 font-medium mt-1">ITCPO - Instituto Tecnológico de Ciudad Valles</p>
                    <p className="text-sm text-gray-500 mt-2">Todos los derechos reservados</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Aviso de Propiedad Intelectual</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Todo el contenido, diseño, código fuente, estructura de datos, interfaces gráficas y funcionalidades del sistema Talent360 Hub son propiedad exclusiva de <strong>Carlos Alfredo Castillo Flores</strong> y están protegidos por las leyes de propiedad intelectual e industrial vigentes en los Estados Unidos Mexicanos.
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mt-3">
                    Queda estrictamente prohibida la reproducción total o parcial, distribución, comunicación pública, transformación o cualquier otra forma de explotación, por cualquier procedimiento, de todo o parte de los contenidos de este sistema sin autorización expresa y por escrito del titular de los derechos.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Desarrollo Académico</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Este sistema fue desarrollado como proyecto académico en el marco del programa de <strong>Ingeniería en Tecnologías de la Información - Desarrollo de Software (ITCPO)</strong>. El código y la documentación asociados son resultado de trabajo original del autor mencionado.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FunctionCard({ title, description, icon, color }: { title: string; description: string; icon: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div className="flex gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}

function PrivacyItem({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 className="font-semibold text-gray-800 mb-2 text-sm">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
            <i className="fas fa-angle-right text-blue-500 mt-0.5 text-xs"></i>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
