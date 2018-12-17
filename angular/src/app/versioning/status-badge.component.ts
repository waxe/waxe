import { Component, Input } from '@angular/core';


@Component({
  selector: 'status-badge',
  template: `
    <span class="badge badge-versioning" [ngClass]="'badge-' + classType" *ngIf="status">
      {{ text }}
    </span>
  `
})
export class VersioningStatusBadgeComponent {

  _status: string;
  public text: string;
  public classType: string;

  STATUS_MAPPING = {
    'A': 'Added',
    '?': 'Added',
    'D': 'Deleted',
    'M': 'Modified',
    'R': 'Renamed',
    'T': 'Type changed',
    'U': 'conflicted',
  };

  BADGE_CSS_MAPPING = {
    'A': 'success',
    '?': 'success',
    'D': 'warning',
    'M': 'secondary',
    'R': 'primary',
    'T': 'warning',
    'U': 'danger',
  };

  @Input()
  set status(s) {
    if (s) {
      this.text = this.STATUS_MAPPING[s];
      this.classType = this.BADGE_CSS_MAPPING[s];
      this._status = s;
    }
  }
  get status(): string {
    return this._status;
  }
}
