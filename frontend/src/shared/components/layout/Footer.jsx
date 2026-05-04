import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
export function Footer() {
    return (<footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company */}
          <div>
            <h3 className="text-white mb-4">Empresa</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Misión</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Prensa</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="text-white mb-4">Para Estudiantes</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Buscar Prácticas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Explorar Empresas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Guías de Carrera</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Preparación CV</a></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-white mb-4">Para Empresas</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Publicar Prácticas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contratar Talento</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Programa de Embajadores</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white mb-4">Recursos</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog Estudiantil</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Guías de Entrevistas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Webinars</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white mb-4">Síguenos</h3>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Facebook className="w-5 h-5"/>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Twitter className="w-5 h-5"/>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Linkedin className="w-5 h-5"/>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Instagram className="w-5 h-5"/>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2025 TalentBridge. Todos los derechos reservados.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>);
}
