export type LayoutAuthDialogType = "login" | "register" | "recovery";

/**
 * Общее состояние auth-попапов для layout header-aside / aside.
 */
export function useLayoutAuth() {
  const authStore = useAuthStore();
  const route = useRoute();

  const authDialogType = ref<LayoutAuthDialogType | null>(null);
  const recoveryEmail = ref("");
  const showMyBookingPopup = ref(false);
  const hasUnauthenticatedBooking = ref(false);

  const checkUnauthenticatedBooking = () => {
    if (typeof window !== "undefined") {
      hasUnauthenticatedBooking.value =
        sessionStorage.getItem("hasUnauthenticatedBooking") === "true";
    }
  };

  watch(
    () => route.path,
    () => {
      checkUnauthenticatedBooking();
    },
  );

  watch(
    () => authStore.isAuthenticated,
    () => {
      checkUnauthenticatedBooking();
      if (authStore.isAuthenticated) {
        showMyBookingPopup.value = false;
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("hasUnauthenticatedBooking");
        }
      }
    },
  );

  const showMyBookingDialog = () => {
    showMyBookingPopup.value = true;
  };

  const hideMyBookingDialog = () => {
    showMyBookingPopup.value = false;
  };

  const handleMyBookingLoginSuccess = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("hasUnauthenticatedBooking");
    }
    hasUnauthenticatedBooking.value = false;
    hideMyBookingDialog();
  };

  const showAuthDialog = (type: LayoutAuthDialogType, email?: string) => {
    authDialogType.value = type;
    if (email) recoveryEmail.value = email;
  };

  const hideAuthDialog = () => {
    authDialogType.value = null;
    recoveryEmail.value = "";
  };

  const switchAuthDialog = (to: LayoutAuthDialogType, email?: string) => {
    authDialogType.value = to;
    if (email) recoveryEmail.value = email;
  };

  onMounted(() => {
    checkUnauthenticatedBooking();
  });

  return {
    authStore,
    authDialogType,
    recoveryEmail,
    showMyBookingPopup,
    hasUnauthenticatedBooking,
    showMyBookingDialog,
    hideMyBookingDialog,
    handleMyBookingLoginSuccess,
    showAuthDialog,
    hideAuthDialog,
    switchAuthDialog,
    checkUnauthenticatedBooking,
  };
}
