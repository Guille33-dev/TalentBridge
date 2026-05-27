import React, { useState } from 'react';
import { Building2, CheckCircle2, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { sendContactMessage } from '@/features/contact/services/contactApi';

const initialForm = {
  name: '',
  email: '',
  topic: 'student',
  subject: '',
  message: '',
  privacyAccepted: false,
};

const topicLabels = {
  student: 'Soy estudiante',
  company: 'Soy empresa',
  support: 'Soporte',
  collaboration: 'Colaboración',
  other: 'Otro',
};

function ContactInfoItem({ icon: Icon, title, children }) {
  return (
    <div className="tb-contact__info-item">
      <span aria-hidden="true">
        <Icon />
      </span>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

export function Contact({ onNavigate }) {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await sendContactMessage({
        ...form,
        topic: topicLabels[form.topic] || form.topic,
      });
      setForm(initialForm);
      setSuccess(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="contact" />

      <main className="flex-1">
        <section className="tb-contact">
          <div className="tb-contact__inner">
            <div className="tb-contact__intro">
              <div>
                <p className="tb-contact__eyebrow">Contacto</p>
                <h1>Hablemos de prácticas, empresas o soporte</h1>
                <p>
                  Escríbenos si tienes dudas sobre TalentBridge, quieres publicar prácticas o necesitas ayuda con tu cuenta.
                  El equipo de administración revisará tu mensaje desde el panel interno.
                </p>
              </div>

              <div className="tb-contact__info">
                <ContactInfoItem icon={Mail} title="Email">
                  infotalentbridge@gmail.com
                </ContactInfoItem>
                <ContactInfoItem icon={Phone} title="Teléfono">
                  +34 672 845 319
                </ContactInfoItem>
                <ContactInfoItem icon={MapPin} title="Ubicación">
                  Sevilla, Andalucía, ES
                </ContactInfoItem>
              </div>
            </div>

            <form className="tb-contact__form" onSubmit={handleSubmit}>
              <div className="tb-contact__form-header">
                <span aria-hidden="true">
                  <MessageSquare />
                </span>
                <div>
                  <h2>Enviar mensaje</h2>
                  <p>Responderemos lo antes posible desde el equipo de TalentBridge.</p>
                </div>
              </div>

              {error && <div className="tb-contact__alert tb-contact__alert--error" role="alert">{error}</div>}
              {success && (
                <div className="tb-contact__alert tb-contact__alert--success" role="status" aria-live="polite">
                  <CheckCircle2 aria-hidden="true" />
                  Mensaje enviado correctamente. El administrador podrá revisarlo desde su panel.
                </div>
              )}

              <div className="tb-contact__fields">
                <div>
                  <Label htmlFor="contact-name">Nombre</Label>
                  <Input
                    id="contact-name"
                    required
                    autoComplete="name"
                    value={form.name}
                    placeholder="Tu nombre"
                    onChange={(event) => updateField('name', event.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="contact-email">Correo electrónico</Label>
                  <Input
                    id="contact-email"
                    required
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    placeholder="tu@email.com"
                    onChange={(event) => updateField('email', event.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="contact-topic">Tipo de consulta</Label>
                  <Select value={form.topic} onValueChange={(value) => updateField('topic', value)}>
                    <SelectTrigger id="contact-topic">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Soy estudiante</SelectItem>
                      <SelectItem value="company">Soy empresa</SelectItem>
                      <SelectItem value="support">Soporte</SelectItem>
                      <SelectItem value="collaboration">Colaboración</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contact-subject">Asunto</Label>
                  <Input
                    id="contact-subject"
                    required
                    value={form.subject}
                    placeholder="Resumen de tu consulta"
                    onChange={(event) => updateField('subject', event.target.value)}
                  />
                </div>

                <div className="tb-contact__field-full">
                  <Label htmlFor="contact-message">Mensaje</Label>
                  <Textarea
                    id="contact-message"
                    required
                    className="min-h-36"
                    value={form.message}
                    placeholder="Cuéntanos en qué podemos ayudarte."
                    onChange={(event) => updateField('message', event.target.value)}
                  />
                </div>

                <label className="tb-contact__privacy">
                  <input
                    type="checkbox"
                    checked={form.privacyAccepted}
                    onChange={(event) => updateField('privacyAccepted', event.target.checked)}
                    required
                  />
                  <span>
                    Acepto que TalentBridge trate mis datos para responder a esta consulta según la política de privacidad.
                  </span>
                </label>
              </div>

              <Button disabled={isSubmitting} type="submit" className="tb-contact__submit">
                <Send className="w-4 h-4" aria-hidden="true" />
                {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
              </Button>
            </form>
          </div>
        </section>

        <section className="tb-contact__support">
          <div className="tb-contact__support-inner">
            <div>
              <Building2 aria-hidden="true" />
              <h2>¿Eres una empresa?</h2>
              <p>También puedes registrarte directamente para crear tu perfil y publicar prácticas cuando esté aprobado.</p>
            </div>
            <Button type="button" onClick={() => onNavigate('company-signup')} className="bg-purple-600 hover:bg-purple-700 text-white">
              Registrar empresa
            </Button>
          </div>
        </section>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
