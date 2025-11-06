import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import MMDAView from '../views/MMDAView.vue';
import PagasaView from '../views/PagasaView.vue';
import PhivolcsView from '../views/PhivolcsView.vue';
import AcledView from '../views/AcledView.vue';
import SettingsView from '../views/SettingsView.vue';
import WindyView from '../views/WindyView.vue';
import LocalWeatherView from '../views/LocalWeatherView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard,
    },
    {
      path: '/mmda',
      name: 'MMDA',
      component: MMDAView,
    },
    {
      path: '/pagasa',
      name: 'PAGASA',
      component: PagasaView,
    },
    {
      path: '/phivolcs',
      name: 'PHIVOLCS',
      component: PhivolcsView,
    },
    {
      path: '/acled',
      name: 'ACLED',
      component: AcledView,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: SettingsView,
    },
    {
      path: '/windy',
      name: 'Windy',
      component: WindyView,
    },
    {
      path: '/local-weather',
      name: 'LocalWeather',
      component: LocalWeatherView,
    },
  ],
});

export default router;

