/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit } from '@angular/core'
import { MatTableDataSource } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Observable } from 'rxjs/Observable';

/**
* Model import Example :
* import { HERO } from '../models/hero.model';
*/

/**
 * Service import Example :
 * import { HeroService } from '../services/hero/hero.service';
 */

@Component({
  selector: 'bh-table',
  templateUrl: './table.template.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})

export class tableComponent implements OnInit {
  test(r) {
    console.log(r);
  }
  ngOnInit() {

  }
  displayedColumns = ['addIcon', 'position', 'name', 'weight', 'symbol'];

  displayedColumns2 = ['position', 'symbol'];
  dataSource = new ExampleDataSource();
  displayObject = false;

  isExpansionDetailRow = (i: number, row: any) => row.hasOwnProperty('detailRow');

  showdisplay() {
    console.log("inside display");
    this.displayObject = true;
  }
}
export interface Element {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: Element[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
];

export class ExampleDataSource extends MatTableDataSource<any> {
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Element[]> {
    const rows = [];
    ELEMENT_DATA.forEach(element => rows.push(element, { detailRow: true, element }));
    return Observable.of(rows);
  }

  disconnect() { }
}