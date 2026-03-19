export interface MercadoJugadorDto {
  jugadorId: number;
  nombre: string;
  posicion: string | null;
  foto: string | null;
  equipoProfesionalNombre: string;
  equipoProfesionalLogo: string | null;
  precio: number;
}
