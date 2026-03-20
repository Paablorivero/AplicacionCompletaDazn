// Este es un dto que devuelve la alineación del equipo de un usuario para una jornada determinada.
// Acordarse que devuelve un Array de jugadores con unos datos completos

export interface JugadorResumenDto {
  jugadorId: number;
  nombre: string;
  posicion: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Attacker';
  foto: string;
  valor?: number;
  equipoProfesionalLogo?: string | null;
  nacionalidad?: string | null;
}
