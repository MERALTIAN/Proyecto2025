import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../database/supabaseconfig';

const AuthContext = createContext();

// Modo de desarrollo: si es true, permite acceso sin validar en Supabase.
// Úsalo solo temporalmente mientras solucionas la confirmación de emails.
const DEV_BYPASS_AUTH = false;
const DEV_USER = { email: 'dev@local', rol: 'administrador' };

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(DEV_BYPASS_AUTH ? DEV_USER : null);
  const [permisos, setPermisos] = useState(DEV_BYPASS_AUTH ? {
    ver_inicio: true,
    ver_catalogo: true,
    ver_productos: true,
    ver_categorias: true,
    ver_empleados: true,
    ver_clientes: true,
    ver_ventas: true,
    ver_permisos: true,
    administrar_sistema: true,
  } : {});
  const [cargando, setCargando] = useState(DEV_BYPASS_AUTH ? false : true);

  const cargarPermisos = async (rol) => {
    if (!rol) return;

    const { data, error } = await supabase
      .from('permisos')
      .select('permisos')
      .eq('rol', rol)
      .single();

      console.log("Permisos cargados para rol:", rol, data);

    if (error) {
      console.error("Error al cargar permisos:", error);
      return;
    }

    setPermisos(data?.permisos || {});
  };

  const login = async (email, password) => {
    if (DEV_BYPASS_AUTH) {
      // Simular login exitoso en modo desarrollo
      localStorage.setItem('usuario-supabase', DEV_USER.email);
      setUsuario(DEV_USER);
      setPermisos({
        ver_inicio: true,
        ver_catalogo: true,
        ver_productos: true,
        ver_categorias: true,
        ver_empleados: true,
        ver_clientes: true,
        ver_ventas: true,
        ver_permisos: true,
        administrar_sistema: true,
      });
      return { user: DEV_USER };
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      const msg = authError?.message || authError?.error_description || '';
      if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('not confirmed')) {
        throw new Error('Por favor confirma tu correo electrónico. Revisa tu bandeja de entrada.');
      }

      // Fallback: si existe el empleado en la tabla `empleados` y el PIN coincide, usarlo como credencial.
      const { data: empleado, error: empError } = await supabase
        .from('empleados')
        .select('tipo_empleado, pin')
        .eq('email', email)
        .single();

      if (!empError && empleado && empleado.pin === password) {
        localStorage.setItem('usuario-supabase', email);
        setUsuario({ email, rol: empleado.tipo_empleado });
        await cargarPermisos(empleado.tipo_empleado);
        return { fallback: true, empleado };
      }

      throw authError;
    }

    const { data: empleado, error: empError } = await supabase
      .from('empleados')
      .select('tipo_empleado')
      .eq('email', email)
      .single();

    if (empError || !empleado) {
      console.error('Error obteniendo empleado:', empError);
      throw new Error('No se encontró información del empleado');
    }

    localStorage.setItem('usuario-supabase', email);
    setUsuario({
      email: email,
      rol: empleado.tipo_empleado,
    });

    await cargarPermisos(empleado.tipo_empleado);
    return authData;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("usuario-supabase");
    setUsuario(null);
    setPermisos({});
  };

  // Cargar sesión al iniciar
  useEffect(() => {
    const cargarSesionInicial = async () => {
      const usuarioGuardado = localStorage.getItem("usuario-supabase");
      
      if (usuarioGuardado) {
        try {
          const { data: empleado, error } = await supabase
            .from('empleados')
            .select('tipo_empleado')
            .eq('email', usuarioGuardado)
            .single();

          if (empleado && !error) {
            setUsuario({
              email: usuarioGuardado,
              rol: empleado.tipo_empleado
            });
            await cargarPermisos(empleado.tipo_empleado);
          } else {
            // Si no se puede obtener el empleado, limpiar sesión
            localStorage.removeItem("usuario-supabase");
          }
        } catch (err) {
          console.error("Error al recuperar sesión:", err);
          localStorage.removeItem("usuario-supabase");
        }
      }
      setCargando(false);
    };

    cargarSesionInicial();
  }, []);

  const tienePermiso = (permiso) => !!permisos[permiso];

  return (
    <AuthContext.Provider value={{
      usuario,
      permisos,
      tienePermiso,
      login,
      logout,
      cargando
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};