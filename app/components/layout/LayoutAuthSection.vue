<script setup lang="ts">
import type { LayoutAuthDialogType } from "~/composables/useLayoutAuth";

defineProps<{
  authDialogType: LayoutAuthDialogType | null;
  recoveryEmail: string;
  showMyBookingPopup: boolean;
}>();

const emit = defineEmits<{
  close: [];
  "switch-to-register": [];
  "switch-to-recovery": [email?: string];
  "switch-to-login": [];
  "login-success": [];
  "my-booking-close": [];
  "my-booking-login-success": [];
}>();
</script>

<template>
  <BookingLoginPopup
    :visible="authDialogType === 'login'"
    @close="emit('close')"
    @switch-to-register="emit('switch-to-register')"
    @switch-to-recovery="emit('switch-to-recovery', $event)"
    @login-success="emit('login-success')"
  />
  <BookingRegisterPopup
    :visible="authDialogType === 'register'"
    @close="emit('close')"
    @switch-to-login="emit('switch-to-login')"
  />
  <BookingPasswordRecoveryPopup
    :visible="authDialogType === 'recovery'"
    :initial-email="recoveryEmail"
    @close="emit('close')"
    @switch-to-login="emit('switch-to-login')"
  />
  <BookingMyBookingPopup
    :visible="showMyBookingPopup"
    @close="emit('my-booking-close')"
    @login-success="emit('my-booking-login-success')"
  />
</template>
