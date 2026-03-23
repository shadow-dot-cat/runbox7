// --------- BEGIN RUNBOX LICENSE ---------
// Copyright (C) 2016-2022 Runbox Solutions AS (runbox.com).
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

import { MessageDisplay } from '../common/messagedisplay';
import { MessageInfo } from './messageinfo';
import { MessageTableRowTool} from '../messagetable/messagetablerow';

export class MessageList extends MessageDisplay {

  // MessageDisplay implementations have different numbers of arguments..
  constructor(...args: any[]) {
    super(args[0]);
  }

  getRowSeen(index: number): boolean {
    const msg: MessageInfo = this.rows[index];
    return !msg.seenFlag;
  }

  getRowId(index: number): number {
    const msg: MessageInfo = this.rows[index];
    return msg?.id;
  }

  getRowMessageId(index: number): number {
    const msg: MessageInfo = this.rows[index];
    return msg?.id;
  }


  // column conversions (at enhance-time, thus _rows)
  getFromColumnValueForRow(rowIndex: number): string {
    const rowobj = this.getUnfilteredRow(rowIndex);
    return rowobj.from && rowobj.from.length > 0 ?
      rowobj.from[0].name ? rowobj.from[0].name :
      rowobj.from[0].address :
    '';
  }

  getToColumnValueForRow(rowIndex: number): string {
    const rowobj = this.getUnfilteredRow(rowIndex);
    return rowobj.to && rowobj.to.length > 0 ?
      rowobj.to[0].name ? rowobj.to[0].name :
      rowobj.to[0].address :
    '';
  }

  // filter visible rows by whatever options the frontend has
  // filterBy(options: Map<string, any>) {
  //   this.rows = this._rows;
  //   if (options.has('unreadOnly') && options.get('unreadOnly')) {
  //     this.rows = this._rows.filter((msg) => !msg.seenFlag);
  //   }
  // }

  filterBy(options: Map<string, any>): any[] {
    if (options.has('unreadOnly') && options.get('unreadOnly')) {
      return this._rows.filter((msg) => !msg.seenFlag);
    }
  }

  // data enhance - _rows
  getRowData(rowIndex) {
    const row = this._rows[rowIndex];

    return {
      id: row.id,
      seen: row.seenFlag,
      messageDate: MessageTableRowTool.formatTimestamp(row.messageDate.toJSON()),
      from: this.getFromColumnValueForRow(rowIndex),
      to: this.getToColumnValueForRow(rowIndex),
      subject: row.subject,
      size: row.size,
      attachment: row.attachment ,
      answered: row.answeredFlag ,
      flagged: row.flaggedFlag ,
      plaintext: row.plaintext?.trim(),
      count: 1,
    }; 
  }
}
