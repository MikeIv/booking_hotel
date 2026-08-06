<script setup lang="ts">
import type { ApiError } from "~/composables/useApi";
import type { ForgotPasswordRequest } from "~/types/auth";
import { useNotificationToast } from "~/composables/useToast";

const props = defineProps<{
  visible: boolean;
  initialEmail?: string;
}>();

const emit = defineEmits<{
  close: [];
  "switch-to-login": [];
}>();

const toast = useNotificationToast();

const email = ref("");
const emailError = ref("");
const apiError = ref<string | null>(null);
const loading = ref(false);
const isSuccess = ref(false);

const validateForm = (): boolean => {
  let isValid = true;
  emailError.value = "";
  apiError.value = null;

  if (!email.value) {
    emailError.value = "Поле обязательно для заполнения";
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    emailError.value = "Введите корректный email";
    isValid = false;
  }

  return isValid;
};

const handleRecovery = async () => {
  if (!validateForm()) return;

  loading.value = true;
  apiError.value = null;

  try {
    const { post } = useApi();
    const body: ForgotPasswordRequest = { email: email.value };
    const response = await post("/v1/auth/password/forgot", body);

    if (response.success) {
      isSuccess.value = true;
      toast.add({
        severity: "success",
        summary: "Письмо отправлено",
        detail:
          response.message ||
          "Инструкции по восстановлению пароля отправлены на вашу почту",
        life: 5000,
      });
    } else {
      apiError.value =
        response.message || "Не удалось отправить письмо для восстановления";
    }
  } catch (err: unknown) {
    const apiErr = err as ApiError;
    const errorData = apiErr.data as { message?: string } | undefined;
    apiError.value =
      errorData?.message ||
      apiErr.message ||
      "Произошла ошибка при отправке запроса";
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  email.value = props.initialEmail || "";
  emailError.value = "";
  apiError.value = null;
  isSuccess.value = false;
  loading.value = false;
};

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      resetForm();
    }
  },
);

defineExpose({ resetForm });
</script>

<template>
  <UiAuthPopup
    :visible="visible"
    header="Восстановление пароля"
    @close="emit('close')"
  >
    <template #content>
      <div v-if="isSuccess" :class="$style.stack">
        <p :class="$style.hint">
          Инструкции по восстановлению пароля отправлены на
          <strong>{{ email }}</strong
          >. Проверьте почту и перейдите по ссылке из письма.
        </p>
      </div>

      <div v-else :class="$style.stack">
        <p :class="$style.hint">
          Введите вашу почту для восстановления пароля
        </p>

        <div :class="$style.fieldStack">
          <label for="recovery-email" :class="$style.label">Почта</label>
          <InputText
            id="recovery-email"
            v-model="email"
            type="email"
            placeholder="Введите вашу почту"
            autocomplete="email"
            :class="[$style.inputFull, { 'p-invalid': emailError }]"
          />
          <small v-if="emailError" class="p-error">{{ emailError }}</small>
        </div>

        <div v-if="apiError" :class="$style.apiError">
          {{ apiError }}
        </div>
      </div>
    </template>

    <template #footer>
      <div :class="$style.footerRow">
        <Button
          v-if="isSuccess"
          label="Назад к входу"
          :class="$style.btnGrow"
          @click="emit('switch-to-login')"
        />
        <template v-else>
          <Button
            label="Восстановить"
            :class="$style.btnGrow"
            :loading="loading"
            :disabled="loading"
            @click="handleRecovery"
          />
          <Button
            label="Назад к входу"
            severity="secondary"
            :class="$style.btnGrow"
            @click="emit('switch-to-login')"
          />
        </template>
      </div>
    </template>
  </UiAuthPopup>
</template>

<style module lang="scss">
  .stack {
    display: flex;
    flex-direction: column;
    gap: rem(16);
  }

  .hint {
    margin: 0;
    color: var(--a-text-light);
    line-height: 1.4;
  }

  .fieldStack {
    display: flex;
    flex-direction: column;
    gap: rem(8);
  }

  .label {
    font-weight: 500;
  }

  .inputFull {
    width: 100%;
  }

  .apiError {
    padding: rem(8) rem(12);
    background-color: var(--a-mainBg);
    border: 1px solid var(--a-border-accent);
    border-radius: var(--a-borderR--input);
    color: var(--a-text-accent);
    font-size: rem(14);
    text-align: center;
  }

  .footerRow {
    display: flex;
    gap: rem(8);
    width: 100%;
  }

  .btnGrow {
    flex: 1;
  }
</style>
