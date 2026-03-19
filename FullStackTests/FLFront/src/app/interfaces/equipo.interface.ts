export interface Equipo {
  equipoId: string;
  nombre: string;
  logo: string | null;
  usuarioId: string;
  ligaId: string;
  presupuesto?: number;
  Liga?: {
    ligaId: string;
    nombreLiga: string;
  };
}
