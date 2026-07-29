import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ChatBoxHeaderComponent } from '../chat-box-header/chat-box-header.component';
import { ChatBoxSendFormComponent } from '../chat-box-send-form/chat-box-send-form.component';

interface ChatItem {
  id: number;
  name: string;
  role: string;
  profileImage: string;
  status: 'online' | 'offline';
  lastActive: string;
  message: string;
  isSender: boolean;
  imagePreview?: string;
}

@Component({
  selector: 'app-chat-box',
  imports: [
    CommonModule,
    ChatBoxHeaderComponent,
    ChatBoxSendFormComponent,
  ],
  templateUrl: './chat-box.component.html',
  styles: ``
})


export class ChatBoxComponent {
  chatList: ChatItem[] = [
    {
      id: 1,
      name: 'Kaiya George',
      role: 'Project Manager',
      profileImage: '/images/user/user-18.jpg',
      status: 'online',
      lastActive: '15 mins',
      message: 'I want to make an appointment tomorrow from 2:00 to 5:00pm?',
      isSender: false,
    },
    {
      id: 2,
      name: 'Lindsey Curtis',
      role: 'Designer',
      profileImage: '/images/user/user-17.jpg',
      status: 'online',
      lastActive: '30 mins',
      message: 'I want to make an appointment tomorrow from 2:00 to 5:00pm?',
      isSender: false,
    },
    {
      id: 3,
      name: 'You',
      role: '',
      profileImage: '',
      status: 'online',
      lastActive: '2 hours ago',
      message: 'If don’t like something, I’ll stay away from it.',
      isSender: true,
    },
    {
      id: 4,
      name: 'Lindsey Curtis',
      role: 'Designer',
      profileImage: '/images/user/user-17.jpg',
      status: 'online',
      lastActive: '2 hours ago',
      message: 'I want more detailed information.',
      isSender: false,
    },
    {
      id: 5,
      name: 'You',
      role: '',
      profileImage: '',
      status: 'online',
      lastActive: '2 hours ago',
      message: 'They got there early, and got really good seats.',
      isSender: true,
    },
    {
      id: 6,
      name: 'Lindsey Curtis',
      role: 'Designer',
      profileImage: '/images/user/user-17.jpg',
      status: 'online',
      lastActive: '2 hours ago',
      message: 'Please preview the image',
      isSender: false,
      imagePreview: '/images/chat/chat.jpg',
    }
  ];
}
