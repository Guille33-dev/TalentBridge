import React, { useEffect, useRef } from 'react';
import { BriefcaseBusiness, FileText, GraduationCap, Mail, MapPin, Phone, UserRound, X } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

const emptyValue = 'No indicado';

const applicationStatusLabels = {
  SUBMITTED: 'Enviada',
  IN_REVIEW: 'En revisión',
  INTERVIEW: 'Entrevista',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  WITHDRAWN: 'Retirada',
};

function getApplicantName(user) {
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  return fullName || user?.email || 'Estudiante TalentBridge';
}

function formatDate(value) {
  if (!value) return emptyValue;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return emptyValue;

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="break-words text-sm text-gray-900">{value || emptyValue}</p>
      </div>
    </div>
  );
}

function TextBlock({ title, children }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-medium text-gray-900">{title}</h3>
      <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3 text-sm leading-6 text-gray-700">
        {children || emptyValue}
      </div>
    </section>
  );
}

export function ApplicantProfileModal({ application, onClose }) {
  const dialogRef = useRef(null);
  const user = application?.user || {};
  const profile = user.profile || {};
  const skills = Array.isArray(profile.skills) ? profile.skills.filter(Boolean) : [];
  const fullName = getApplicantName(user);
  const initials =
    profile.avatarInitials ||
    `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() ||
    'TB';

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement;
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = Array.from(dialogRef.current?.querySelectorAll(focusableSelector) || []);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    window.requestAnimationFrame(() => {
      const firstFocusableElement = dialogRef.current?.querySelector(focusableSelector);
      firstFocusableElement?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [onClose]);

  if (!application) return null;

  return (
    <div
      className="fixed inset-0 overflow-y-auto bg-black/50 px-3 py-4 sm:px-6 sm:py-8"
      style={{ zIndex: 9999 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="applicant-profile-title"
        className="mx-auto w-full max-w-4xl rounded-xl border border-gray-200 bg-white shadow-xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-purple-600">Perfil del candidato</p>
            <h2 id="applicant-profile-title" className="mt-1 text-xl text-gray-950">
              {fullName}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Postulación para {application.job?.title || 'una práctica'}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar perfil">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6 px-5 py-5 sm:px-6">
          <section className="flex flex-col gap-4 rounded-xl border border-purple-100 bg-purple-50/50 p-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-xl font-medium text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg text-gray-950">{fullName}</h3>
              <p className="text-sm text-gray-600">
                {profile.major || 'Estudios no indicados'}
                {profile.university ? ` · ${profile.university}` : ''}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">{applicationStatusLabels[application.status] || application.status}</Badge>
                <Badge variant="outline">Perfil {profile.profileCompletion || 0}%</Badge>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoItem icon={Mail} label="Correo electrónico" value={user.email} />
            <InfoItem icon={Phone} label="Teléfono" value={profile.phone} />
            <InfoItem icon={MapPin} label="Ubicación" value={profile.location} />
            <InfoItem icon={BriefcaseBusiness} label="Disponibilidad" value={profile.availability} />
            <InfoItem icon={GraduationCap} label="Centro educativo" value={profile.university} />
            <InfoItem icon={UserRound} label="Estudios / curso" value={[profile.major, profile.semester].filter(Boolean).join(' · ')} />
          </section>

          <TextBlock title="Bio del estudiante">{profile.bio}</TextBlock>

          <section>
            <h3 className="mb-2 text-sm font-medium text-gray-900">Habilidades</h3>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3 text-sm text-gray-600">
                El estudiante todavía no ha añadido habilidades.
              </div>
            )}
          </section>

          <TextBlock title="Carta de presentación">{application.coverLetter}</TextBlock>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoItem icon={FileText} label="Siguiente paso" value={application.nextStep} />
            <InfoItem icon={FileText} label="Fecha de postulación" value={formatDate(application.createdAt)} />
          </section>
        </div>
      </div>
    </div>
  );
}
