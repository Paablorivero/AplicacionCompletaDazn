
// Tipo la respuesta que vamos a recibir al hacer login. Las tipo las dos juntas para no crear demasiados archivos de interfaces
// y se tienen aqui las dos a mano. Además así no hay que importar una interface aquí.

export interface UserLoginResponse {
  token: string;
  user: AuthUser;
}

export interface AuthUser {
  uuid: string;
  username: string;
  rol: string;
}
