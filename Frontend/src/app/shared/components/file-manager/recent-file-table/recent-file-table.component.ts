
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-recent-file-table',
  imports: [
    RouterModule
],
  templateUrl: './recent-file-table.component.html',
  styles: ``
})
export class RecentFileTableComponent {

  tableData = [
    {
      fileName: 'Video_947954.mp4',
      fileIcon: {
        light: '/images/icons/file-video.svg',
        dark: '/images/icons/file-video-dark.svg',
      },
      category: 'Video',
      size: '89 MB',
      dateModified: '12 Jan, 2027',
    },
    {
      fileName: 'Travel.jpg',
      fileIcon: {
        light: '/images/icons/file-image.svg',
        dark: '/images/icons/file-image-dark.svg',
      },
      category: 'Image',
      size: '5.4 MB',
      dateModified: '10 Feb, 2027',
    },
    {
      fileName: 'Document.pdf',
      fileIcon: {
        light: '/images/icons/file-pdf.svg',
        dark: '/images/icons/file-pdf-dark.svg',
      },
      category: 'Document',
      size: '1.2 MB',
      dateModified: '8 Mar, 2027',
    },
    {
      fileName: 'Video_947954_028.mp4',
      fileIcon: {
        light: '/images/icons/file-video.svg',
        dark: '/images/icons/file-video-dark.svg',
      },
      category: 'Video',
      size: '489 MB',
      dateModified: '29 Apr, 2027',
    },
    {
      fileName: 'Mountain.png',
      fileIcon: {
        light: '/images/icons/file-image.svg',
        dark: '/images/icons/file-image-dark.svg',
      },
      category: 'Image',
      size: '5.4 MB',
      dateModified: '10 Feb, 2027',
    },
    {
      fileName: 'CV.pdf',
      fileIcon: {
        light: '/images/icons/file-pdf.svg',
        dark: '/images/icons/file-pdf-dark.svg',
      },
      category: 'Document',
      size: '12 MB',
      dateModified: '17 Jun, 2027',
    },
    {
      fileName: 'Video_09783_882943.mp4',
      fileIcon: {
        light: '/images/icons/file-video.svg',
        dark: '/images/icons/file-video-dark.svg',
      },
      category: 'Video',
      size: '309 MB',
      dateModified: '27 Jul, 2027',
    },
  ];

  isDarkMode = false;
  private themeSubscription: Subscription | undefined;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService.theme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
}
