<template>
  <div class="flex justify-between h-screen">

    <div class="w-full flex flex-col justify-center items-center gap-6">
      <div>
        <h2 class="text-4xl font-bold">ورود به پنل کاربری</h2>
      </div>
      <div class="flex flex-col gap-2 w-full max-w-xl px-3.5">
        <AppInput
            v-model="userName"
            label="نام کاربری"
            type="text"
            name="userName"
            placeholder="نام کاربری"
            required
        />
      </div>
      <div class="flex flex-col gap-2 w-full max-w-xl px-3.5">
        <AppInput
            v-model="password"
            label="رمزعبور"
            type="password"
            name="password"
            placeholder="رمز عبور"
            required
        />
      </div>
      <div class="w-full max-w-xl px-3.5">
        <ButtonComponent
            :disabled="!userName || !password"
            :isLoading="isLoading"
            severity="primary"
            size="large"
            class="w-full"
            @click="loginHandle"
        >
          ورود
        </ButtonComponent
        >

      </div>
    </div>
    <div class="w-auto hidden lg:block h-screen">
      <img
          src="/images/login-art.svg"
          alt="login-art"
          class="h-full w-full object-cover"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref} from "vue";
import AppInput from "@/components/app/AppInput.vue";
import ButtonComponent from "@/components/shared/ButtonComponent.vue";
import {useLogin} from "@/api/auth";
import {useRouter} from "vue-router";
import {useWebSocket} from "@/composables/useWebSocket";
import type {ILogIn} from "@/types/auth";
import {toast} from "vue3-toastify";

const userName = ref<string>("");
const password = ref<string>("");
const isLoading = ref<boolean>(false);
const {mutateAsync: login} = useLogin();
const router = useRouter();
const { connect } = useWebSocket();

const loginHandle = async () => {
  isLoading.value = true;
  try {
    const payload: ILogIn = {
      username: userName.value,
      password: password.value,
    };
    await login(payload);
    connect();
    toast.success('با موفقیت وارد شدید .')
    isLoading.value = false;
    router.push({ name: 'Chat' });
  } catch (error) {
    isLoading.value = false;
  }
};
</script>
