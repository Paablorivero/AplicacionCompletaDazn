// Interface para typar los datos que mandamos cuando nos registramos

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fechaNacimiento: string;
}


export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  fechaNacimiento: Date;
}

// He puesto tipo date porque creo que habeis usado un datepicker luego habrá que tranformalo a string, que es lo que se
// manda en las peticiones
