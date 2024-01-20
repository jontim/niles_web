// frontend.js
import { AuthModule } from 'public/auth.js';
import { UIModule } from 'public/ui.js';
import { APIModule } from 'public/api.js';

document.addEventListener('DOMContentLoaded', () => {
    AuthModule.init();
    UIModule.init();
    APIModule.init();
});