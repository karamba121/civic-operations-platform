
import { Component } from '@angular/core';
import { FolderCardComponent } from '../folder-card/folder-card.component';

@Component({
  selector: 'app-all-folders',
  imports: [
    FolderCardComponent
],
  templateUrl: './all-folders.component.html',
  styles: ``
})
export class AllFoldersComponent {
  folderData = [
    { title: 'Images', fileCount: '345', size: '26.40 GB' },
    { title: 'Documents', fileCount: '130', size: '26.40 GB' },
    { title: 'Apps', fileCount: '130', size: '26.40 GB' },
    { title: 'Downloads', fileCount: '345', size: '26.40 GB' },
  ];
}
