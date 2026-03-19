import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '../Services/translate.service';

@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  constructor(private ts: TranslateService) {}

  transform(key: string): string {
    return this.ts.get(key);
  }
}
