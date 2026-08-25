<template>
  <ion-app>
    <Toast position="top-center" class="toast-style" />
    <ion-router-outlet  />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import Toast from 'primevue/toast'
import '@/assets/fonts.css'

</script>

<style>
:root {
  font-family: 'Poppins', sans-serif;
}

input {
  background-color: #FFF;
  color: #000;
}

body {
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
}

/* Tela de loading falsa */
.loading-container {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: #0b0b0c;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  width: 100%;
  max-width: 320px;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.loading-logo {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 32px;
}

.loading-bar-track {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
  margin-bottom: 16px;
}

.loading-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #ff8a00, #ff6a00);
  transition: width 0.25s ease;
}

.loading-tip {
  min-height: 20px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
  margin: 0 0 24px;
}

.tip-fade-enter-active,
.tip-fade-leave-active {
  transition: opacity 0.3s ease;
}

.tip-fade-enter-from,
.tip-fade-leave-to {
  opacity: 0;
}

.ready-button {
  padding: 12px 28px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(90deg, #ff8a00, #ff6a00);
  color: #ffffff;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(255, 106, 0, 0.35);
}

/* Tela de abertura (vídeo) */
.intro-container {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.intro-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.unmute-button {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000000;
  padding: 12px 24px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  color: #000;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Toast */
.p-toast {
  z-index: 99999 !important;
}

.p-toast-message {
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  background: #ffffff !important;
  opacity: 1 !important;
}

.p-toast-message-content {
  padding: 1rem !important;
}

.p-toast-summary,
.p-toast-detail {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@media(max-width: 576px){
  .toast-style{
    width: 100% !important;
    max-width: 100% !important;
    left: 0 !important;
    right: 0 !important;
    transform: none !important;
    box-sizing: border-box;
    padding: 0 8px;
  }
}
</style>