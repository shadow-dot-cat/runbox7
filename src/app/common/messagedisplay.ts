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

export abstract class MessageDisplay {
  public openedRowIndex: number;
  public selectedRowId: number;
  public msgIdsSelected: { [key: number]: boolean } = {};
  public hasChanges: boolean;
  public filterOptions: Map<string, any>;

  // ALL rows
  public _rows = [];
  // (Subset of) raw rows for actual display
  public rows = [];

  public renderedRange = {start: 0, end: 0};

  constructor(rows: any) {
    this.setRows(rows);
  }

  setRows(rows: any) {
    this._rows = rows;
    console.log(`MD update rows len: ${this._rows.length}`);
    // set after enriching:
    this.rows = [];

    // zoom and enhance:
    // this.enrichRows();

    // defaults to all rows, see filterBy for reduced sets
  }

  // displayed rows count:
  rowCount(): number {
    return this.rows.length;
  }

  // row indexes which are selected
  selectedRowIds(): number[] {
    return Object.keys(this.msgIdsSelected).map((msgIndex) => this.findRowByMessageId(parseInt(msgIndex, 10)));
  }

  // msgIds which are actually selected (value is true, not false)
  selectedMessageIds(): number[] {
    return Object.keys(this.msgIdsSelected).filter((msgId) => this.msgIdsSelected[parseInt(msgId, 10)]).map((msgId) => parseInt(msgId, 10));
  }

  // true if we selected all included messages
  allSelected(): boolean {
    return Object.keys(this.msgIdsSelected).filter((key) => this.msgIdsSelected[key]).length === this.rows.length;
  }

  // true if any messages are selected
  anySelected(): boolean {
    return Object.values(this.msgIdsSelected).includes(true);
  }

  // invert message selection
  public flipSelectedRow(rowIndex: number) {
    const msgId = this.getRowMessageId(rowIndex);
    this.msgIdsSelected[msgId] = !this.msgIdsSelected[msgId];
  }

  // select all known rows:
  public selectAllRows() {
    this.rows.forEach((value, index) => {
      this.msgIdsSelected[this.getRowMessageId(index)] = true;
    });
  }

  // ensure this message is selected
  public selectRow(rowIndex: number) {
    const msgId = this.getRowMessageId(rowIndex);
    this.msgIdsSelected[msgId] = true;
  }

  // remove item from selection list altogether
  public delSelectedRow(rowIndex: number) {
    const msgId = this.getRowMessageId(rowIndex);
    delete this.msgIdsSelected[msgId];
  }

  // row clicked on (any field that isnt the checkbox)
  public getCurrentRow(): any {
    return this.rows[this.openedRowIndex];
  }

  public findRowByMessageId(messageId: number) {
    return this.rows.findIndex((element, index) => {
      return this.getRowMessageId(index) === messageId;
    });
  }

  public removeMessages(messageIds: number[]) {
    const filteredRows = [];
    this.rows.forEach((value, index) => {
      if (!messageIds.includes(this.getRowMessageId(index))) {
        filteredRows.push(value);
      }
    });
    this.rows = filteredRows;
  }

  public rowSelected(rowIndex: number, columnIndex: number, multiSelect?: boolean) {
    this.hasChanges = false;
    if (!this.rowExists(rowIndex)) {
      return;
    }
    //    const selectedRowId = this.getRowId(rowIndex);
    const selectedRowId = rowIndex;

    // Drag&Drop, if we click to drag, we don't want to change the state of
    // the selection.
    // UNLESS: no messages are selected, then we select+drag one.
    if (columnIndex === -1) {
      if (this.isSelectedRow(rowIndex)) {
        return;
      }
    }

    // multiSelect just means do these, nothing else:
    // multiSelect is true if we're applying rowSelect in a loop
    this.selectedRowId = selectedRowId;

    // flip sense of selected row (deleted below if now false)
    if (columnIndex >= -1) {
      this.flipSelectedRow(this.selectedRowId);
    }
    if (multiSelect) {
      // MS is a special snowflake:
      this.selectRow(this.selectedRowId);
      return;
    }

    // click anywhere on a row right of the checkbox, reset the selected rows
    // as we want to open the email instead
    if (columnIndex > 0) {
      this.msgIdsSelected = {};
    }

    // columnIndex == -1 if drag & drop
    // columnIndex == 0 is the checkbox
    // we're removing this one from the selected list (sense reversed
    // above, but we only remove when not in multiSelect mode)
    if (columnIndex === 0 && !this.isSelectedRow(this.selectedRowId)) {
      this.selectedRowId = null;
      this.delSelectedRow(selectedRowId);
    }

    // If we clicked right of the checkbox, we wanted to open the email:
    if (columnIndex > 0) {
      this.openedRowIndex = rowIndex;

      this.hasChanges = true;
    }
  }

  // row entries
  abstract getRowSeen(index: number): boolean;
  abstract getRowId(index: number): number;
  abstract getRowMessageId(index: number): number;

  public getUnfilteredRow(index: number): any {
    return this._rows[index];
  }

  rowExists(index: number): boolean {
    return this.rows[index] && this.getRowMessageId(index) > 0 ? true : false;
  }

  isBoldRow(index: number): boolean {
    return this.getRowSeen(index);
  }

  isSelectedRow(index: number): boolean {
    if (index >= this.rows.length) {
      return false;
    }
    const msgId = this.getRowMessageId(index);
    if (msgId > 0) {
      return this.msgIdsSelected[msgId] === true;
    }
    return false;
  }

  isOpenedRow(index: number): boolean {
    return index === this.openedRowIndex;
  }

  clearSelection() {
    this.selectedRowId = null;
    this.msgIdsSelected = {};
  }

  clearOpenedRow() {
    this.openedRowIndex = null;
  }

  // Which messages are (about to be) shown?
  // used to pre-fetch message contents
  getDisplayedMessageIds() {
    const { start, end } = this.renderedRange;

    return this._rows.filter(
      (val, index) => index >= start && index <= end).map(
        (val, index) => this._rows[index]);
  }

  // enhance / homogenise row data:
  async enrichRows(cbPreDisplay) {
    if (!this._rows.length) return;

    const { start, end } = this.renderedRange;

    // filter unread _rows, mapping _row indexes to filtered indexes

    const messageIds = [];
    for (let index = start; index < end; index++) {
      if (index >= this._rows.length) break;

      this._rows[index].display = this.getRowData(index);
      messageIds.push(this._rows[index].display.id);
      this._rows[index].loaded = true;
    }
    cbPreDisplay(messageIds);

    this.rows = this._rows;
  }

  // filtering:
  abstract filterBy(options: Map<string, any>): any[];

  // columns
  abstract getRowData(index: number): any;
}
