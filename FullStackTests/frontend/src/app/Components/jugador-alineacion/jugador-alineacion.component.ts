import {Component, Input} from '@angular/core';
import {JugadorResumenDto} from '../../interfaces/dtos/jugadorresumendto';

const NATIONALITY_TO_CODE: Record<string, string> = {
  Afghanistan:'af',Albania:'al',Algeria:'dz',Andorra:'ad',Angola:'ao',Argentina:'ar',
  Armenia:'am',Australia:'au',Austria:'at',Azerbaijan:'az',Bahrain:'bh',Bangladesh:'bd',
  Belarus:'by',Belgium:'be',Benin:'bj',Bolivia:'bo',Bosnia:'ba','Bosnia and Herzegovina':'ba',
  Brazil:'br',Bulgaria:'bg','Burkina Faso':'bf',Burundi:'bi',Cameroon:'cm',Canada:'ca',
  'Cape Verde':'cv','Central African Republic':'cf',Chad:'td',Chile:'cl',China:'cn',
  Colombia:'co',Comoros:'km',Congo:'cg','Congo DR':'cd','Costa Rica':'cr',Croatia:'hr',
  Cuba:'cu',Curacao:'cw',Cyprus:'cy','Czech Republic':'cz',Czechia:'cz',Denmark:'dk',
  'DR Congo':'cd',Ecuador:'ec',Egypt:'eg','El Salvador':'sv','Equatorial Guinea':'gq',
  Eritrea:'er',Estonia:'ee',Ethiopia:'et',Finland:'fi',France:'fr',Gabon:'ga',Gambia:'gm',
  Georgia:'ge',Germany:'de',Ghana:'gh',Greece:'gr',Grenada:'gd',Guatemala:'gt',Guinea:'gn',
  'Guinea-Bissau':'gw',Haiti:'ht',Honduras:'hn',Hungary:'hu',Iceland:'is',India:'in',
  Indonesia:'id',Iran:'ir',Iraq:'iq',Ireland:'ie',Israel:'il',Italy:'it','Ivory Coast':'ci',
  "Cote D'Ivoire":'ci',Jamaica:'jm',Japan:'jp',Jordan:'jo',Kazakhstan:'kz',Kenya:'ke',
  Korea:'kr','Korea Republic':'kr','South Korea':'kr',Kosovo:'xk',Kuwait:'kw',
  Kyrgyzstan:'kg',Latvia:'lv',Lebanon:'lb',Liberia:'lr',Libya:'ly',Lithuania:'lt',
  Luxembourg:'lu',Madagascar:'mg',Malawi:'mw',Malaysia:'my',Mali:'ml',Malta:'mt',
  Mauritania:'mr',Mauritius:'mu',Mexico:'mx',Moldova:'md',Monaco:'mc',Montenegro:'me',
  Morocco:'ma',Mozambique:'mz',Namibia:'na',Netherlands:'nl','New Zealand':'nz',
  Nicaragua:'ni',Niger:'ne',Nigeria:'ng','North Macedonia':'mk',Norway:'no',Oman:'om',
  Pakistan:'pk',Palestine:'ps',Panama:'pa',Paraguay:'py',Peru:'pe',Philippines:'ph',
  Poland:'pl',Portugal:'pt',Qatar:'qa',Romania:'ro',Russia:'ru',Rwanda:'rw',
  'Saudi Arabia':'sa',Scotland:'gb-sct',Senegal:'sn',Serbia:'rs','Sierra Leone':'sl',
  Singapore:'sg',Slovakia:'sk',Slovenia:'si',Somalia:'so','South Africa':'za',
  Spain:'es','Sri Lanka':'lk',Sudan:'sd',Suriname:'sr',Sweden:'se',Switzerland:'ch',
  Syria:'sy',Tanzania:'tz',Thailand:'th',Togo:'tg','Trinidad and Tobago':'tt',
  Tunisia:'tn',Turkey:'tr',Turkmenistan:'tm',Uganda:'ug',Ukraine:'ua',
  'United Arab Emirates':'ae','United States':'us',USA:'us',Uruguay:'uy',Uzbekistan:'uz',
  Venezuela:'ve',Vietnam:'vn',Wales:'gb-wls',Yemen:'ye',Zambia:'zm',Zimbabwe:'zw',
  England:'gb-eng','Northern Ireland':'gb-nir',
};

@Component({
  selector: 'app-jugador-alineacion',
  standalone: true,
  templateUrl: './jugador-alineacion.component.html',
  styleUrl: './jugador-alineacion.component.css',
})
export class JugadorAlineacionComponent {
  @Input() jugador!: JugadorResumenDto;
  @Input() selected: boolean = false;

  get posicionLabel(): string {
    const labels: Record<string, string> = {
      Goalkeeper: 'POR',
      Defender: 'DEF',
      Midfielder: 'MED',
      Attacker: 'DEL'
    };
    return labels[this.jugador?.posicion] ?? this.jugador?.posicion ?? '';
  }

  get valorLabel(): string {
    const v = this.jugador?.valor;
    if (!v) return '—';
    if (v >= 1_000_000) {
      const m = v / 1_000_000;
      return (m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)) + 'M';
    }
    if (v >= 1_000) return Math.round(v / 1_000) + 'K';
    return v.toString();
  }

  get flagUrl(): string | null {
    const nat = this.jugador?.nacionalidad;
    if (!nat) return null;
    const code = NATIONALITY_TO_CODE[nat];
    if (!code) return null;
    return `https://flagcdn.com/w160/${code}.png`;
  }
}
