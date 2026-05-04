import React, { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';

export const COOKIE_CONSENT_STORAGE_KEY = 'talentbridge.cookieConsent';
export const OPEN_COOKIE_SETTINGS_EVENT = 'talentbridge:openCookieSettings';

const defaultPreferences = {
  necessary: true,
  preferences: false,
  analytics: false,
};

function readStoredConsent() {
  try {
    const storedConsent = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    return storedConsent ? JSON.parse(storedConsent) : null;
  } catch {
    return null;
  }
}

function saveConsent(preferences) {
  const nextConsent = {
    necessary: true,
    preferences: Boolean(preferences.preferences),
    analytics: Boolean(preferences.analytics),
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(nextConsent));
  return nextConsent;
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}

function CookieSettingsModal({ preferences, onChange, onAcceptAll, onRejectOptionals, onSave, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4" style={{ zIndex: 9999 }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-settings-title"
        className="w-full rounded-xl bg-white border border-gray-200 shadow-2xl p-6 sm:p-6"
        style={{ maxWidth: '640px' }}
      >
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h2 id="cookie-settings-title" className="text-2xl text-gray-900 mb-2">Configuración de cookies</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Puedes aceptar o rechazar las cookies opcionales. Las necesarias permanecen activas porque permiten que la web funcione correctamente.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Checkbox checked disabled className="mt-1" />
              <div>
                <h3 className="text-lg text-gray-900 mb-1">Necesarias</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Imprescindibles para recordar la sesión, mantener la seguridad y guardar tu decisión sobre cookies.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={preferences.preferences}
                onCheckedChange={(checked) => onChange('preferences', Boolean(checked))}
                className="mt-1"
              />
              <div>
                <h3 className="text-lg text-gray-900 mb-1">Preferencias</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Permiten recordar ajustes de experiencia, como preferencias visuales o futuras opciones de personalización.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={preferences.analytics}
                onCheckedChange={(checked) => onChange('analytics', Boolean(checked))}
                className="mt-1"
              />
              <div>
                <h3 className="text-lg text-gray-900 mb-1">Analíticas</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Ayudarían a entender el uso de la web para mejorarla. No se activarán si las rechazas.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
          <Button type="button" variant="outline" onClick={onRejectOptionals}>Rechazar opcionales</Button>
          <Button type="button" variant="outline" onClick={onAcceptAll}>Aceptar todas</Button>
          <Button type="button" onClick={onSave} className="bg-purple-600 hover:bg-purple-700 text-white">Guardar preferencias</Button>
        </div>
        <button type="button" onClick={onClose} className="mt-4 text-sm text-gray-600 hover:text-gray-900">
          Cerrar sin guardar
        </button>
      </div>
    </div>
  );
}

export function CookieConsent() {
  const [consent, setConsent] = useState(null);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const storedConsent = readStoredConsent();
    setConsent(storedConsent);
    setPreferences(storedConsent || defaultPreferences);
    setIsLoaded(true);

    const handleOpenSettings = () => {
      const latestConsent = readStoredConsent();
      setPreferences(latestConsent || defaultPreferences);
      setIsSettingsOpen(true);
    };

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);
  }, []);

  const persistConsent = (nextPreferences) => {
    const nextConsent = saveConsent(nextPreferences);
    setConsent(nextConsent);
    setPreferences(nextConsent);
    setIsSettingsOpen(false);
  };

  const acceptAll = () => {
    persistConsent({ necessary: true, preferences: true, analytics: true });
  };

  const rejectOptionals = () => {
    persistConsent({ necessary: true, preferences: false, analytics: false });
  };

  const savePreferences = () => {
    persistConsent(preferences);
  };

  const updatePreference = (key, value) => {
    setPreferences((current) => ({ ...current, necessary: true, [key]: value }));
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <>
      {!consent && !isSettingsOpen && (
        <div className="fixed left-0 right-0 px-4" style={{ bottom: '16px', zIndex: 9998 }}>
          <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-xl shadow-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h2 className="text-xl text-gray-900 mb-2">Usamos cookies</h2>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Utilizamos cookies necesarias para que TalentBridge funcione y, si lo aceptas, cookies opcionales de preferencias y analíticas para mejorar la experiencia.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="button" variant="outline" onClick={rejectOptionals}>Rechazar opcionales</Button>
                <Button type="button" variant="outline" onClick={() => setIsSettingsOpen(true)}>Configurar</Button>
                <Button type="button" onClick={acceptAll} className="bg-purple-600 hover:bg-purple-700 text-white">Aceptar todas</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <CookieSettingsModal
          preferences={preferences}
          onChange={updatePreference}
          onAcceptAll={acceptAll}
          onRejectOptionals={rejectOptionals}
          onSave={savePreferences}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
}
