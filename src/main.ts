import { createApp } from 'vue'
import App from './views/DashboardView.vue'
import './assets/tailwind.css'
import PrimeVue from 'primevue/config';

createApp(App).use(PrimeVue).mount('#app')
