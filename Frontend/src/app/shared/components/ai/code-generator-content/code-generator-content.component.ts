import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatHeaderComponent } from '../chat-header/chat-header.component';
import { CodeBlockComponent } from '../code-block/code-block.component';
import { ShareModalComponent } from '../share-modal/share-modal.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { TooltipDirective } from '../../../directive/tooltip.directive';

export interface CodeChatMessage {
  role: 'user' | 'ai';
  text: string;
  isEditing?: boolean;
  draft?: string;
  copied?: boolean;
  code?: string;
  codeLanguage?: string;
  codeTitle?: string;
  model?: string;
}

@Component({
  selector: 'app-code-generator-content',
  imports: [
    CommonModule,
    FormsModule,
    CodeBlockComponent,
    ChatHeaderComponent,
    ShareModalComponent,
    ChatInputComponent,
    TooltipDirective
  ],
  templateUrl: './code-generator-content.component.html',
  styles: ``
})
export class CodeGeneratorContentComponent {
  // Share Modal
  isShareModalOpen = false;

  openShareModal() {
    this.isShareModalOpen = true;
  }

  closeShareModal() {
    this.isShareModalOpen = false;
  }

  // Model selector state
  selectedModel = 'Claude Sonnet 4.6';
  modelDropdownOpen = false;

  // New prompt input state
  promptInput = '';

  toggleModelDropdown() {
    this.modelDropdownOpen = !this.modelDropdownOpen;
  }

  closeModelDropdown() {
    this.modelDropdownOpen = false;
  }

  selectModel(model: string) {
    this.selectedModel = model;
    this.modelDropdownOpen = false;
  }

  // Messages list state
  messages: CodeChatMessage[] = [
    {
      role: 'user',
      text: 'Create a code Login form code'
    },
    {
      role: 'ai',
      model: 'Claude Sonnet 4.6',
      text: 'Here is a premium, clean, responsive, and interactive HTML/CSS login form styled with a sleek gradient background, custom hover effects, and Google Fonts integration.',
      codeLanguage: 'html',
      codeTitle: 'Login form code',
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Form</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }

    .login-container {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h1 {
      color: #333;
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .login-header p {
      color: #666;
      font-size: 0.9rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e1e5e9;
      border-radius: 5px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .login-btn {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease;
      margin-bottom: 1rem;
    }

    .login-btn:hover {
      transform: translateY(-2px);
    }

    .divider {
      text-align: center;
      margin: 1.5rem 0;
      position: relative;
      color: #666;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e1e5e9;
      z-index: 1;
    }

    .divider span {
      background: white;
      padding: 0 1rem;
      position: relative;
      z-index: 2;
    }

    .social-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .social-btn {
      padding: 0.75rem;
      border: 2px solid #e1e5e9;
      border-radius: 5px;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      text-decoration: none;
      color: #333;
      font-weight: 500;
    }

    .social-btn:hover {
      border-color: #667eea;
      transform: translateY(-2px);
    }

    .google-btn:hover {
      background: #db4437;
      color: white;
      border-color: #db4437;
    }

    .github-btn:hover {
      background: #333;
      color: white;
      border-color: #333;
    }

    .forgot-password {
      text-align: center;
      margin-top: 1rem;
    }

    .forgot-password a {
      color: #667eea;
      text-decoration: none;
      font-size: 0.9rem;
    }

    .forgot-password a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="login-header">
      <h1>Welcome Back</h1>
      <p>Please sign in to your account</p>
    </div>
    
    <form id="loginForm">
      <div class="form-group">
        <label for="email">Email Address</label>
        <input type="email" id="email" name="email" required>
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required>
      </div>
      
      <button type="submit" class="login-btn">Sign In</button>
    </form>
  </div>
</body>
</html>`
    }
  ];

  // Send message
  sendMessage(prompt: string) {
    if (!prompt || !prompt.trim()) return;

    const userMsg: CodeChatMessage = {
      role: 'user',
      text: prompt
    };
    this.messages.push(userMsg);

    const oldPrompt = prompt;

    // Simulated AI response after 1 second
    setTimeout(() => {
      const generatedCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Custom Layout for ${oldPrompt}</title>
  <style>
    body {
      background: #f3f4f6;
      color: #111827;
      font-family: sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      max-width: 400px;
      width: 100%;
    }
    h1 {
      font-size: 20px;
      margin-bottom: 12px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Custom Component</h1>
    <p>Generated dynamically for prompt: "${oldPrompt}"</p>
  </div>
</body>
</html>`;

      const aiMsg: CodeChatMessage = {
        role: 'ai',
        model: this.selectedModel,
        text: `Here is the custom responsive boilerplate code designed for: "${oldPrompt}". Built using standard semantic HTML elements and simple, clean, inline styles for easy integration.`,
        codeLanguage: 'html',
        codeTitle: oldPrompt,
        code: generatedCode
      };
      this.messages.push(aiMsg);
    }, 1000);
  }

  // Editing methods
  editMessage(msg: CodeChatMessage) {
    msg.isEditing = true;
    msg.draft = msg.text;
  }

  editCodePrompt(index: number) {
    if (index > 0 && this.messages[index - 1]) {
      this.editMessage(this.messages[index - 1]);
    }
  }

  cancelEdit(msg: CodeChatMessage) {
    msg.isEditing = false;
    msg.draft = '';
  }

  saveEdit(msg: CodeChatMessage) {
    if (msg.draft && msg.draft.trim()) {
      msg.text = msg.draft.trim();
    }
    msg.isEditing = false;
  }

  // Copy methods
  copyMessage(msg: CodeChatMessage) {
    navigator.clipboard.writeText(msg.text).then(() => {
      msg.copied = true;
      setTimeout(() => (msg.copied = false), 2000);
    });
  }

  // File selected placeholder
  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      alert(`Selected file: ${file.name}`);
    }
  }
}
