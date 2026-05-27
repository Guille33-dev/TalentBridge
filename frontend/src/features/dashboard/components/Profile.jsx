import React, { useEffect, useRef, useState } from 'react';
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Edit } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { fetchMyProfile, updateMyProfile } from '@/features/profile/services/profileApi';

function formatYear(value) {
    if (!value) return 'Año no especificado';
    if (value === 'egresado') return 'Egresado/a';
    if (/^\d+$/.test(value)) return `${value}º año`;
    return value;
}

export function Profile() {
    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        university: '',
        major: '',
        semester: '',
        phone: '',
        location: '',
        availability: '',
        bio: '',
        skills: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const formRef = useRef(null);
    const firstInputRef = useRef(null);

    const syncForm = (data) => {
        const profile = data?.profile || {};
        setFormData({
            firstName: data?.firstName || '',
            lastName: data?.lastName || '',
            university: profile.university || '',
            major: profile.major || '',
            semester: profile.semester || '',
            phone: profile.phone || '',
            location: profile.location || '',
            availability: profile.availability || '',
            bio: profile.bio || '',
            skills: (profile.skills || []).join(', '),
        });
    };

    useEffect(() => {
        let ignore = false;

        async function loadProfile() {
            setIsLoading(true);
            setError(null);

            try {
                const result = await fetchMyProfile();
                if (!ignore) {
                    setProfileData(result);
                    syncForm(result);
                }
            } catch (requestError) {
                if (!ignore) setError(requestError.message);
            } finally {
                if (!ignore) setIsLoading(false);
            }
        }

        loadProfile();

        return () => {
            ignore = true;
        };
    }, []);

    const handleChange = (field, value) => {
        setFormData((current) => ({ ...current, [field]: value }));
    };

    const handleEdit = () => {
        setIsEditing(true);
        setSuccessMessage(null);
    };

    useEffect(() => {
        if (!isEditing) return;

        window.requestAnimationFrame(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            firstInputRef.current?.focus({ preventScroll: true });
        });
    }, [isEditing]);

    const handleCancel = () => {
        syncForm(profileData);
        setIsEditing(false);
        setError(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const updatedProfile = await updateMyProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                university: formData.university,
                major: formData.major,
                semester: formData.semester,
                phone: formData.phone,
                location: formData.location,
                availability: formData.availability,
                bio: formData.bio,
                skills: formData.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
            });
            setProfileData(updatedProfile);
            syncForm(updatedProfile);
            setIsEditing(false);
            setSuccessMessage('Perfil actualizado correctamente.');
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="bg-white rounded-xl border border-gray-200 p-6">Cargando perfil...</div>;
    }

    if (error && !profileData) {
        return <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6" role="alert">{error}</div>;
    }

    const profile = profileData?.profile || {};
    const fullName = `${profileData?.firstName || ''} ${profileData?.lastName || ''}`.trim();
    const initials = profile.avatarInitials || `${profileData?.firstName?.charAt(0) || ''}${profileData?.lastName?.charAt(0) || ''}`.toUpperCase() || 'TB';
    const completion = profile.profileCompletion || 0;
    const skills = profile.skills?.length ? profile.skills : [];

    return (<div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y preferencias</p>
        </div>
        <Button onClick={handleEdit} className="w-full bg-purple-600 hover:bg-purple-700 text-white sm:w-auto">
          <Edit className="w-4 h-4 mr-2"/>
          Editar Perfil
        </Button>
      </div>

      {successMessage && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm" role="status" aria-live="polite">{successMessage}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm" role="alert">{error}</div>}

      {isEditing && (
        <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-6">
          <div>
            <h2 className="text-xl mb-1">Editar perfil</h2>
            <p className="text-sm text-gray-600">Actualiza la información que verán las empresas cuando revisen tu postulación.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="profile-first-name" className="block leading-5">Nombre</Label>
              <Input ref={firstInputRef} id="profile-first-name" value={formData.firstName} onChange={(event) => handleChange('firstName', event.target.value)} placeholder="Nombre" />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="profile-last-name" className="block leading-5">Apellidos</Label>
              <Input id="profile-last-name" value={formData.lastName} onChange={(event) => handleChange('lastName', event.target.value)} placeholder="Apellidos" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="profile-university" className="block leading-5">Centro Educativo o Universidad</Label>
              <Input id="profile-university" value={formData.university} onChange={(event) => handleChange('university', event.target.value)} placeholder="IES, centro educativo o universidad" />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="profile-major" className="block leading-5">Estudios</Label>
              <Input id="profile-major" value={formData.major} onChange={(event) => handleChange('major', event.target.value)} placeholder="Desarrollo de Aplicaciones Web" />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="profile-semester" className="block leading-5">Año</Label>
              <Input id="profile-semester" value={formData.semester} onChange={(event) => handleChange('semester', event.target.value)} placeholder="2º año" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="profile-phone" className="block leading-5">Teléfono</Label>
              <Input id="profile-phone" value={formData.phone} onChange={(event) => handleChange('phone', event.target.value)} placeholder="+34 600 000 000" />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="profile-location" className="block leading-5">Ubicación</Label>
              <Input id="profile-location" value={formData.location} onChange={(event) => handleChange('location', event.target.value)} placeholder="Madrid" />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="profile-availability" className="block leading-5">Disponibilidad</Label>
              <Input id="profile-availability" value={formData.availability} onChange={(event) => handleChange('availability', event.target.value)} placeholder="4-6 meses" />
            </div>
          </div>

          <div className="min-w-0 space-y-2">
            <Label htmlFor="profile-skills" className="block leading-5">Habilidades</Label>
            <Input id="profile-skills" value={formData.skills} onChange={(event) => handleChange('skills', event.target.value)} placeholder="React, Node.js, SQL" />
            <p className="text-xs text-gray-500 mt-2">Separalas con comas.</p>
          </div>

          <div className="min-w-0 space-y-2">
            <Label htmlFor="profile-bio" className="block leading-5">Bio</Label>
            <Textarea id="profile-bio" value={formData.bio} onChange={(event) => handleChange('bio', event.target.value)} placeholder="Cuenta brevemente qué tipo de prácticas buscas." />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button type="submit" disabled={isSaving} className="bg-purple-600 hover:bg-purple-700 text-white">
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Profile Completeness */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg">Completitud del Perfil</h3>
          <span className="text-purple-600">{completion}%</span>
        </div>
        <Progress value={completion} className="mb-4"/>
        <div className="flex flex-wrap gap-2">
          <Badge variant={profile.phone || profile.location ? 'secondary' : 'outline'}>Información Básica</Badge>
          <Badge variant={profile.university ? 'secondary' : 'outline'}>Educación</Badge>
          <Badge variant={profile.skills?.length ? 'secondary' : 'outline'}>Habilidades</Badge>
          <Badge variant={profile.bio ? 'secondary' : 'outline'}>Bio</Badge>
          <Badge variant={profile.availability ? 'secondary' : 'outline'}>Disponibilidad</Badge>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Información Básica</h2>
          <Button variant="outline" size="icon" onClick={handleEdit} aria-label="Editar informacion basica" className="h-9 w-9 rounded-lg">
            <Edit className="w-4 h-4"/>
          </Button>
        </div>

        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl sm:text-2xl mb-2 break-words">{fullName || 'Estudiante TalentBridge'}</h3>
            <p className="text-gray-600 mb-4">{profile.major || 'Completa tus estudios'} {profile.university ? `· ${profile.university}` : ''}</p>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Añade tus habilidades para completar tu perfil.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3 text-gray-700">
            <Mail className="w-5 h-5 text-gray-400"/>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{profileData?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Phone className="w-5 h-5 text-gray-400"/>
            <div>
              <p className="text-sm text-gray-500">Teléfono</p>
              <p>{profile.phone || 'No especificado'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <MapPin className="w-5 h-5 text-gray-400"/>
            <div>
              <p className="text-sm text-gray-500">Ubicación</p>
              <p>{profile.location || 'No especificada'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Briefcase className="w-5 h-5 text-gray-400"/>
            <div>
              <p className="text-sm text-gray-500">Disponibilidad</p>
              <p>{profile.availability || 'No especificada'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Educación</h2>
          <Button variant="outline" size="icon" onClick={handleEdit} aria-label="Editar educacion" className="h-9 w-9 rounded-lg">
            <Edit className="w-4 h-4"/>
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-gray-600"/>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="mb-1">{profile.major || 'Estudios no especificados'}</h3>
            <p className="text-gray-600 mb-2">{profile.university || 'Centro educativo o universidad no especificado'}</p>
            <p className="text-sm text-gray-500 mb-2">{formatYear(profile.semester)}</p>
            <p className="text-sm text-gray-700">{profile.bio || 'Añade una bio para contar qué estás buscando.'}</p>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Habilidades</h2>
          <Button variant="outline" size="icon" onClick={handleEdit} aria-label="Editar habilidades" className="h-9 w-9 rounded-lg">
            <Edit className="w-4 h-4"/>
          </Button>
        </div>

        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (<Badge key={skill} variant="secondary" className="px-4 py-2">
              {skill}
            </Badge>))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">Todavía no has añadido habilidades.</p>
        )}
      </div>
    </div>);
}
