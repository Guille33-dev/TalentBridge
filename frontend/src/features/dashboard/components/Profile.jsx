import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Edit } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { fetchMyProfile, updateMyProfile } from '@/features/profile/services/profileApi';

export function Profile() {
    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({
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

    const syncForm = (data) => {
        const profile = data?.profile || {};
        setFormData({
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
        return <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">{error}</div>;
    }

    const profile = profileData?.profile || {};
    const fullName = `${profileData?.firstName || ''} ${profileData?.lastName || ''}`.trim();
    const initials = profile.avatarInitials || `${profileData?.firstName?.charAt(0) || ''}${profileData?.lastName?.charAt(0) || ''}`.toUpperCase() || 'TB';
    const completion = profile.profileCompletion || 0;
    const skills = profile.skills?.length ? profile.skills : ['Añade tus habilidades'];

    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y preferencias</p>
        </div>
        <Button onClick={() => setIsEditing(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Edit className="w-4 h-4 mr-2"/>
          Editar Perfil
        </Button>
      </div>

      {successMessage && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm">{successMessage}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>}

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <h2 className="text-xl mb-1">Editar perfil</h2>
            <p className="text-sm text-gray-600">Actualiza la información que verán las empresas cuando revisen tu postulación.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="profile-phone" className="mb-2 block">Telefono</Label>
              <Input id="profile-phone" value={formData.phone} onChange={(event) => handleChange('phone', event.target.value)} placeholder="+34 600 000 000" />
            </div>
            <div>
              <Label htmlFor="profile-location" className="mb-2 block">Ubicación</Label>
              <Input id="profile-location" value={formData.location} onChange={(event) => handleChange('location', event.target.value)} placeholder="Madrid" />
            </div>
            <div>
              <Label htmlFor="profile-availability" className="mb-2 block">Disponibilidad</Label>
              <Input id="profile-availability" value={formData.availability} onChange={(event) => handleChange('availability', event.target.value)} placeholder="4-6 meses" />
            </div>
          </div>

          <div>
            <Label htmlFor="profile-skills" className="mb-2 block">Habilidades</Label>
            <Input id="profile-skills" value={formData.skills} onChange={(event) => handleChange('skills', event.target.value)} placeholder="React, Node.js, SQL" />
            <p className="text-xs text-gray-500 mt-1">Separalas con comas.</p>
          </div>

          <div>
            <Label htmlFor="profile-bio" className="mb-2 block">Bio</Label>
            <Textarea id="profile-bio" value={formData.bio} onChange={(event) => handleChange('bio', event.target.value)} placeholder="Cuenta brevemente qué tipo de prácticas buscas." />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
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
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg">Completitud del Perfil</h3>
          <span className="text-purple-600">{completion}%</span>
        </div>
        <Progress value={completion} className="mb-4"/>
        <div className="flex flex-wrap gap-2">
          <Badge variant={profileData?.email ? 'secondary' : 'outline'}>Información Básica</Badge>
          <Badge variant={profile.university ? 'secondary' : 'outline'}>Educación</Badge>
          <Badge variant={profile.skills?.length ? 'secondary' : 'outline'}>Habilidades</Badge>
          <Badge variant={profile.bio ? 'secondary' : 'outline'}>Bio</Badge>
          <Badge variant={profile.availability ? 'secondary' : 'outline'}>Disponibilidad</Badge>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Información Básica</h2>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4"/>
          </Button>
        </div>

        <div className="flex gap-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl">
            {initials}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl mb-2">{fullName || 'Estudiante TalentBridge'}</h3>
            <p className="text-gray-600 mb-4">{profile.major || 'Completa tu carrera'} {profile.university ? `· ${profile.university}` : ''}</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}
            </div>
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

      {/* Work Experience */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Experiencia (Opcional)</h2>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4"/>
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 text-gray-600"/>
            </div>
            <div className="flex-1">
              <h3 className="mb-1">Proyecto Personal - Aplicación Web</h3>
              <p className="text-gray-600 mb-2">Desarrollo Independiente</p>
              <p className="text-sm text-gray-500 mb-3">Ene 2024 - Presente</p>
              <p className="text-gray-700">
                Desarrollo de una aplicación web completa utilizando React, Node.js y MongoDB. 
                Implementación de autenticación, diseño responsive y despliegue en producción.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 text-gray-600"/>
            </div>
            <div className="flex-1">
              <h3 className="mb-1">Líder de Proyecto - Hackathon Universitario</h3>
              <p className="text-gray-600 mb-2">Universidad Nacional</p>
              <p className="text-sm text-gray-500 mb-3">Oct 2024</p>
              <p className="text-gray-700">
                Lideré un equipo de 4 personas para crear una solución tecnológica en 48 horas. 
                Obtuvimos el segundo lugar entre 20 equipos participantes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Educación</h2>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4"/>
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-gray-600"/>
          </div>
          <div className="flex-1">
            <h3 className="mb-1">{profile.major || 'Carrera no especificada'}</h3>
            <p className="text-gray-600 mb-2">{profile.university || 'Universidad no especificada'}</p>
            <p className="text-sm text-gray-500 mb-2">{profile.semester ? `${profile.semester} semestre` : 'Semestre no especificado'}</p>
            <p className="text-sm text-gray-700">{profile.bio || 'Añade una bio para contar qué estás buscando.'}</p>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Habilidades</h2>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4"/>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (<Badge key={skill} variant="secondary" className="px-4 py-2">
              {skill}
            </Badge>))}
        </div>
      </div>
    </div>);
}
