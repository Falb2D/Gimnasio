// public/js/shared/clasesService.js
// Servicio centralizado de Clases — Backend: Supabase

class ClasesService {

  // Mapea fila de Supabase al formato que usan las vistas
  _mapearClase(row) {
    const inscritos = (row.inscripciones || []).map(i => ({
      id   : i.socio_id,
      dni  : i.socios ? i.socios.dni : '',
      nombre: i.socios ? `${i.socios.nombres} ${i.socios.apellidos}` : '',
    }));
    return { ...row, inscritos };
  }

  async obtenerClases() {
    const { data, error } = await window.supabaseClient
      .from('clases')
      .select('*, inscripciones(id, socio_id, socios(nombres, apellidos, dni))')
      .order('fecha_hora', { ascending: true });

    if (error) { console.error('Error obtenerClases:', error); return []; }
    return (data || []).map(c => this._mapearClase(c));
  }

  async obtenerClasePorId(id) {
    const { data, error } = await window.supabaseClient
      .from('clases')
      .select('*, inscripciones(id, socio_id, socios(nombres, apellidos, dni))')
      .eq('id', id)
      .single();

    if (error) { console.error('Error obtenerClasePorId:', error); return null; }
    return this._mapearClase(data);
  }

  async obtenerClasePorNombre(nombre) {
    const { data, error } = await window.supabaseClient
      .from('clases')
      .select('*, inscripciones(id, socio_id, socios(nombres, apellidos, dni))')
      .eq('nombre', nombre)
      .single();

    if (error) { console.error('Error obtenerClasePorNombre:', error); return null; }
    return this._mapearClase(data);
  }

  async crearClase(datos) {
    const payload = {
      nombre      : datos.nombre      || 'Sin nombre',
      fecha_hora  : datos.fecha_hora  || new Date().toISOString(),
      coach_nombre: datos.coach_nombre || datos.coach || 'Sin asignar',
      ubicacion   : datos.ubicacion   || datos.salon || 'Sin ubicación',
      capacidad_max: parseInt(datos.capacidad_max) || 20,
      icono       : datos.icono       || 'fa-calendar-check',
      bg_icono    : datos.bg_icono    || 'bg-secondary',
      text_icono  : datos.text_icono  || 'text-secondary',
      estado      : datos.estado      || 'Activa',
    };

    const { data, error } = await window.supabaseClient
      .from('clases')
      .insert(payload)
      .select()
      .single();

    if (error) { console.error('Error crearClase:', error); return null; }
    return this._mapearClase({ ...data, inscripciones: [] });
  }

  async actualizarClase(id, datos) {
    const { data, error } = await window.supabaseClient
      .from('clases')
      .update(datos)
      .eq('id', id)
      .select()
      .single();

    if (error) { console.error('Error actualizarClase:', error); return null; }
    return data;
  }

  async cancelarClase(id) {
    const { error } = await window.supabaseClient
      .from('clases')
      .update({ estado: 'Cancelada' })
      .eq('id', id);

    if (error) { console.error('Error cancelarClase:', error); return false; }
    return true;
  }

  async inscribirSocio(claseId, socioId) {
    const { error } = await window.supabaseClient
      .from('inscripciones')
      .insert({ clase_id: claseId, socio_id: socioId });

    if (error) { console.error('Error inscribirSocio:', error); return false; }
    return true;
  }

  async desuscribirSocio(claseId, socioId) {
    const { error } = await window.supabaseClient
      .from('inscripciones')
      .delete()
      .eq('clase_id', claseId)
      .eq('socio_id', socioId);

    if (error) { console.error('Error desuscribirSocio:', error); return false; }
    return true;
  }

  // Helpers síncronos (reciben el objeto clase ya mapeado)
  calcularPorcentajeOcupacion(clase) {
    if (!clase || !clase.capacidad_max || clase.capacidad_max <= 0) return 0;
    const reservas = clase.inscritos ? clase.inscritos.length : 0;
    return Math.round((reservas / clase.capacidad_max) * 100);
  }

  estaLlena(clase) {
    if (!clase) return false;
    const reservas = clase.inscritos ? clase.inscritos.length : 0;
    return reservas >= clase.capacidad_max;
  }

  obtenerEstadoVisual(clase) {
    const estadoClase = clase && (clase.estado || clase.estado_clase);
    if (estadoClase === 'Cancelada') {
      return { color: 'danger', badge: 'Cancelada', colorBadge: 'danger' };
    }
    const porcentaje = this.calcularPorcentajeOcupacion(clase);
    if (porcentaje >= 100) return { color: 'danger',  badge: 'Clase Llena', colorBadge: 'danger' };
    if (porcentaje >= 80)  return { color: 'warning', badge: 'Casi Lleno',  colorBadge: 'warning' };
    return { color: 'success', badge: 'Cupos Libres', colorBadge: 'success' };
  }
}

const clasesService = new ClasesService();
