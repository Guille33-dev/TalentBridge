import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FileText, Clock, XCircle, Calendar, MessageCircle } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/shared/components/ui/tabs";
import { fetchMyApplications, withdrawApplication } from "@/features/applications/services/applicationsApi";

const statusLabels = {
    SUBMITTED: "Postulación Enviada",
    IN_REVIEW: "En Revisión",
    INTERVIEW: "Entrevista Programada",
    ACCEPTED: "Aceptada",
    REJECTED: "No Seleccionado",
    WITHDRAWN: "Retirada",
};

const statusTypes = {
    SUBMITTED: "pending",
    IN_REVIEW: "in-progress",
    INTERVIEW: "interview",
    ACCEPTED: "interview",
    REJECTED: "rejected",
    WITHDRAWN: "rejected",
};

function formatDate(value) {
    return new Date(value).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}
const getStatusIcon = (statusType) => {
    switch (statusType) {
        case "interview":
            return <Calendar className="w-5 h-5 text-green-600"/>;
        case "in-progress":
            return <Clock className="w-5 h-5 text-yellow-600"/>;
        case "pending":
            return <FileText className="w-5 h-5 text-blue-600"/>;
        case "rejected":
            return <XCircle className="w-5 h-5 text-red-600"/>;
        default:
            return <FileText className="w-5 h-5 text-gray-600"/>;
    }
};
const getStatusColor = (statusType) => {
    switch (statusType) {
        case "interview":
            return "bg-green-100 text-green-700";
        case "in-progress":
            return "bg-yellow-100 text-yellow-700";
        case "pending":
            return "bg-blue-100 text-blue-700";
        case "rejected":
            return "bg-red-100 text-red-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
};
export function Applications({ onNavigate }) {
    const [applications, setApplications] = useState([]);
    const [contactApplication, setContactApplication] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let ignore = false;

        async function loadApplications() {
            setIsLoading(true);
            setError(null);

            try {
                const result = await fetchMyApplications();
                if (!ignore) setApplications(result);
            } catch (requestError) {
                if (!ignore) setError(requestError.message);
            } finally {
                if (!ignore) setIsLoading(false);
            }
        }

        loadApplications();

        return () => {
            ignore = true;
        };
    }, []);

    const handleWithdraw = async (applicationId) => {
        try {
            const updated = await withdrawApplication(applicationId);
            setApplications((items) => items.map((item) => (item.id === applicationId ? updated : item)));
        } catch (requestError) {
            setError(requestError.message);
        }
    };

    const handleViewApplication = (job) => {
        onNavigate?.("job-detail", job.slug || job.id);
    };

    const closeContactModal = () => {
        setContactApplication(null);
    };

    const normalizedActiveApps = applications.filter((app) => statusTypes[app.status] !== "rejected");
    const normalizedArchivedApps = applications.filter((app) => statusTypes[app.status] === "rejected");

    if (isLoading) {
        return <div className="bg-white rounded-xl border border-gray-200 p-6">Cargando postulaciones...</div>;
    }

    return (<div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Mis Postulaciones</h1>
        <p className="text-gray-600">
          {applications.length} postulaciones totales
        </p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm" role="alert">{error}</div>}

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            Activas ({normalizedActiveApps.length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archivadas ({normalizedArchivedApps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-4">
          {normalizedActiveApps.length === 0 && <div className="bg-white rounded-xl border border-gray-200 p-6 text-gray-600">Todavía no tienes postulaciones activas.</div>}
          {normalizedActiveApps.map((app) => (<div key={app.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={app.job.company.logo} alt={app.job.company.name} className="w-full h-full object-cover"/>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl mb-1">
                        {app.job.title}
                      </h3>
                      <p className="text-gray-600">
                        {app.job.company.name}
                      </p>
                    </div>
                    <Badge className={getStatusColor(statusTypes[app.status])}>
                      {statusLabels[app.status] || app.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    <span>Postulado: {formatDate(app.createdAt)}</span>
                  </div>

                  {app.nextStep && (<div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4">
                      {getStatusIcon(statusTypes[app.status])}
                      <div>
                        <p className="text-sm text-gray-900">
                          {app.nextStep}
                        </p>
                      </div>
                    </div>)}

                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={() => handleViewApplication(app.job)}>
                      Ver Postulación
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setContactApplication(app)}>
                      Contactar Reclutador
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleWithdraw(app.id)}>
                      Retirar
                    </Button>
                  </div>
                </div>
              </div>
            </div>))}
        </TabsContent>

        <TabsContent value="archived" className="mt-6 space-y-4">
          {normalizedArchivedApps.length === 0 && <div className="bg-white rounded-xl border border-gray-200 p-6 text-gray-600">No hay postulaciones archivadas.</div>}
          {normalizedArchivedApps.map((app) => (<div key={app.id} className="bg-white rounded-xl border border-gray-200 p-6 opacity-60">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={app.job.company.logo} alt={app.job.company.name} className="w-full h-full object-cover"/>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl mb-1">
                        {app.job.title}
                      </h3>
                      <p className="text-gray-600">
                        {app.job.company.name}
                      </p>
                    </div>
                    <Badge className={getStatusColor(statusTypes[app.status])}>
                      {statusLabels[app.status] || app.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span>Postulado: {formatDate(app.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>))}
        </TabsContent>
      </Tabs>

      {contactApplication && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4" style={{ zIndex: 9999 }}>
          <div role="dialog" aria-modal="true" aria-labelledby="student-contact-dialog-title" className="w-full max-w-md rounded-xl bg-white border border-gray-200 shadow-xl p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 id="student-contact-dialog-title" className="text-lg mb-1">Contacto con reclutador</h2>
                <p className="text-sm text-gray-600">
                  {contactApplication.job.company.name} revisará tu postulación y contactará contigo desde la plataforma si tu proceso avanza.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-700 space-y-2">
              <p><span className="text-gray-500">Práctica:</span> {contactApplication.job.title}</p>
              <p><span className="text-gray-500">Estado:</span> {statusLabels[contactApplication.status] || contactApplication.status}</p>
              {contactApplication.nextStep && <p><span className="text-gray-500">Siguiente paso:</span> {contactApplication.nextStep}</p>}
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button type="button" variant="outline" onClick={closeContactModal}>
                Cerrar
              </Button>
              <Button type="button" onClick={() => handleViewApplication(contactApplication.job)} className="bg-purple-600 hover:bg-purple-700 text-white">
                Ver práctica
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>);
}
