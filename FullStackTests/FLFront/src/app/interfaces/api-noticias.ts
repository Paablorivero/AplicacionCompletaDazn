import { NoticiaInterface } from "./noticia-interface";

export interface ApiNoticias {
  status: string;
  totalResults: number;
  articles: NoticiaInterface[];
}
