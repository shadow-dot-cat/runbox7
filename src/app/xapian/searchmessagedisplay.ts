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
import { SearchService } from './searchservice';
import { MessageTableRowTool} from '../messagetable/messagetablerow';

export class SearchMessageDisplay extends MessageDisplay {
  private searchService: SearchService;

  // MessageDisplay implementations have different numbers of arguments..
  constructor(...args: any[]) {
    super(args[1]);    
    this.searchService = args[0];
  }

  setRows(rows: any) {
    // searchResults are a tuple: [documentId, X]
    // turn it into an object:
    const row_list = [];
    if(rows.length > 0) {
      rows.forEach((val) => {
        row_list.push({'docId': val[0], 'threaded': val[1] + 1 });
      });
    }
    super.setRows(row_list);    
  }

  getRowSeen(index: number): boolean {
    return this.searchService.getDocData(this.rows[index]).seen ? false : true;
  }

  getRowId(index: number): number {
    return this._rows[index].docId;
  }

  getRowMessageId(index: number): number {
    let msgId = 0;
    // if (index >= this.rows.length) {
    //   return 0;
    // }
    try {
      msgId = this.searchService.getMessageIdFromDocId(this.rows[index].docId);
    } catch (e) {
      // This shouldnt happen, it means something changed the stored
      // data without updating the messagedisplay rows.
      console.error('Tried to lookup ' + index + ' in searchIndex, isnt there! ', e);
    }
    return msgId;
  }

  filterBy(options: Map<string, any>): any[] {
    return this._rows;
  }

  public getRowData(index: number) {
    const msgId = this.searchService.getMessageIdFromDocId(this.getUnfilteredRow(index).docId);
    const rowData: any = {
      id: msgId,
      messageDate: MessageTableRowTool.formatTimestampFromStringWithoutSeparators(this.searchService.api.getStringValue(this.getRowId(index), 2)),
      to: this.searchService.getDocData(this.getRowId(index)).recipients.join(', '),
      from: this.searchService.getDocData(this.getRowId(index)).from,
      subject: this.searchService.getDocData(this.getRowId(index)).subject,
      // plaintext: this.searchService.getDocData(this.getRowId(index)).textcontent?.trim(),
      plaintext: this.searchService.messageText(msgId),
      size: this.searchService.api.getNumericValue(this.getRowId(index), 3),
      attachment: this.searchService.getDocData(this.getRowId(index)).attachment ? true : false,
      answered: this.searchService.getDocData(this.getRowId(index)).answered ? true : false,
      flagged: this.searchService.getDocData(this.getRowId(index)).flagged ? true : false,
      folder: this.searchService.getDocData(this.getRowId(index)).folder,
      seen: this.searchService.getDocData(this.getRowId(index)).seen ? true : false,
      count: this._rows[index].threaded,
    };

    // if (app.viewmode === 'conversations') {
    //   const rowObj = this.getRow(index);

    //   const conversationId = this.searchService.api.getStringValue(rowObj.docId, 1);
    //   this.searchService.api.setStringValueRange(1, 'conversation:');
    //   const conversationSearchText = `conversation:${conversationId}..${conversationId}`;
    //   const results = this.searchService.api.sortedXapianQuery(
    //     conversationSearchText,
    //     1, 0, 0, 1000, 1
    //   );
    //   this.searchService.api.clearValueRange();

    //   if (results[0]?.[1]) {
    //     rowObj[2] = `${results[0][1] + 1}`;
    //     rowData.count = rowObj[2];
    //   } else {
    //     rowData.count = 1;
    //   }
    // }

    return rowData;
  }
}
