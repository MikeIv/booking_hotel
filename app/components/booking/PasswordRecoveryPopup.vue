<template>
  <UiAuthPopup
    :visible="visible"
    header="Восстановление пароля"
    @close="emit('close')"
  >
    <template #content>
      <div :class="$style.stack">
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
            :class="[$style.inputFull, { 'p-invalid': emailError }]"
          />
          <small v-if="emailError" class="p-error">{{ emailError }}</small>
        </div>
      </div>
    </template>

    <template #footer>
      <div :class="$style.footerRow">
        <Button
          label="Восстановить"
          :class="$style.btnGrow"
          :loading="loading"
          @click="handleRecovery"
        />
        <Button
          label="Назад к входу"
          severity="secondary"
          :class="$style.btnGrow"
          @click="emit('switch-to-login')"
        />
      </div>
    </template>
  </UiAuthPopup>
</template>

<script setup lang="ts">
  import { ref } from "vue";

  const props = defineProps<{
    visible: boolean;
    initialEmail?: string;
  }>();

  const emit = defineEmits<{
    close: [];
    "switch-to-login": [];
  }>();

  const email = ref("");
  const emailError = ref("");
  const loading = ref(false);

  if (props.initialEmail) {
    email.value = props.initialEmail;
  }

  const validateForm = () => {
    let isValid = true;
    emailError.value = "";

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

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Запрос на восстановление отправлен:", {
        email: email.value,
      });
      emit("close");
    } catch (error) {
      console.error("Ошибка восстановления:", error);
    } finally {
      loading.value = false;
    }
  };

  defineExpose({
    resetForm: () => {
      email.value = props.initialEmail || "";
      emailError.value = "";
    },
  });
</script>

<style module lang="scss">
  .stack {
    display: flex;
    flex-direction: column;
    gap: rem(16);
  }

  .hint {
    margin: 0;
    color: var(--a-text-light);
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

  .footerRow {
    display: flex;
    gap: rem(8);
    width: 100%;
  }

  .btnGrow {
    flex: 1;
  }
</style>
