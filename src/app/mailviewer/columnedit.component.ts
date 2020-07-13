// --------- BEGIN RUNBOX LICENSE ---------
// Copyright (C) 2016-2020 Runbox Solutions AS (runbox.com).
// 
// This file is part of Runbox 7.
// 
// Runbox 7 is free software: You can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the
// Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
// 
// Runbox 7 is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with Runbox 7. If not, see <https://www.gnu.org/licenses/>.
// ---------- END RUNBOX LICENSE ----------
import {
  Component, Input
} from '@angular/core';
import { AppComponent } from '../app.component';
import { CanvasTableColumn} from '../canvastable/canvastable';
import { MessageInfo } from '../xapian/messageinfo';
// import { MessageTableRowTool} from '../messagetable/messagetablerow';

@Component({
  moduleId: 'angular2/app/columnedit/',
  selector: 'app-columnedit',
  templateUrl: 'columnedit.component.html',
})

export class ColumnEditComponent {
  _defaultcolumns: Map<string, string[]> = new Map();
  // FIXME: what should this "any" be?
  _availablecolumns: Map <string, any> = new Map();
  @Input() editcolumns: string[];

  constructor() {
    // extracted from message list so far!
    this._availablecolumns.set('Date', { sortColumn: 2, rowWrapModeMuted: true } );
    this._availablecolumns.set('To', { });
    this._availablecolumns.set('From', { sortColumn: 0 });
    this._availablecolumns.set('Subject', {
      sortColumn: 1,
      draggable: true,
    });
    // this._availablecolumns.set('_Preview', {
    //   rowWrapModeHidden: true,
    //   virtual: true,
    //   width: 0,
    // });
    this._availablecolumns.set('Count', {
      rowWrapModeHidden: true,
      textAlign: 1,
//      getFormattedValue: (val) => val === '-1' ? '\u267B' : MessageTableRowTool.formatBytes(val),
    });
    this._availablecolumns.set('Size', {
      rowWrapModeHidden: true,
      textAlign: 1,
//      getFormattedValue: (val) => val === '-1' ? '\u267B' : MessageTableRowTool.formatBytes(val),
    });
    this._availablecolumns.set('Attachment', { isIcon: true, getFormattedValue: (val) => val ? '\uE226' : '' } );
    this._availablecolumns.set('Answered', { isIcon: true, getFormattedValue: (val) => val ? '\uE15E' : '' } );
    this._availablecolumns.set('Flagged', { isIcon: true, getFormattedValue:  (val) => val ? '\uE153' : '' } );
    // isIcon =  textAlign: 2, rowWrapModeHidden: true, font: '16px \'Material Icons\'', + dont display the name, sortColumn: null,

    this._defaultcolumns.set('messagelist', [ 'Date', 'To', 'From', 'Subject', 'Size', 'Attachment', 'Answered', 'Flagged' ]);
    this._defaultcolumns.set('searchservice', [ 'Date', 'To', 'From', 'Subject', 'Size', 'Attachment', 'Answered', 'Flagged' ]);
    this._defaultcolumns.set('websocketservice', [ 'Date', 'To', 'From', 'Subject', 'Size', 'Attachment', 'Answered', 'Flagged' ]);
  }

  // FIXME: what should this "any" be? (looks like MessageInfo | searchResult (whatever that last one actually is)

  constructColumnList(displayOf: string, buildList: Map<string, (rowobj: any) => any>, app: AppComponent): CanvasTableColumn[] {

    // Either we display a list the user picked themselves
    // Or use the default for this type of display (search/message/websocket)
    // Always add the _Preview!?
    const colList = app.personalviewcolumns.length > 0 ? [ ...app.personalviewcolumns, '_Preview'] : this._defaultcolumns.get(displayOf);
    const columns: CanvasTableColumn[] = [
      {
        sortColumn: null,
        name: '',
        rowWrapModeHidden: false,
        getValue: (rowobj: MessageInfo): any => app.isSelectedRow(rowobj),
        checkbox: true,
        draggable: true
      },
    ];

    colList.forEach((col) => {
      let colargs = Object.assign({
        name: this._availablecolumns.get(col).isIcon ? '' : col,
        getValue: buildList.get(col),
      },
      this._availablecolumns.get(col),
                                 );
      if (this._availablecolumns.get(col).isIcon) {
        colargs = Object.assign(
          colargs,
          {
            textAlign: 2,
            rowWrapModeHidden: true,
            font: '16px \'Material Icons\'',
            getFormattedValue: this._availablecolumns.get(col).getFormattedValue,
          });
      }
      columns.push(colargs);
    });

    return columns;
  }

  columnDragged(ev: DragEvent, column: string) {
    ev.dataTransfer.setData('column', column);
  }

  columnDropped(ev: DragEvent, targetCol: string) {
    const moveCol = ev.dataTransfer.getData('column');
  }

}
