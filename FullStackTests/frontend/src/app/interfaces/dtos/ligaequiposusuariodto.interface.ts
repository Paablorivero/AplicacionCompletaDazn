
// Este es otro DTO concreto para la respuesta que se recibe desde el endpoint que devuelve los participantes
// de la liga.
export interface LigaEquiposUsuarioDto {
  ligaId: string;
  nombreLiga: string;
  usuarioId: string;
  Equipos: EquipoParticipanteDto[];
}

interface EquipoParticipanteDto {
  nombre: string;
  Usuario: UsuarioResumenDto;
}

interface UsuarioResumenDto {
  username: string;
}
