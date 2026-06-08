<template>
    <AppModal v-model:visible="visible">
        <template #container>
            <div class="flex flex-col" dir="rtl">
                <!-- Header -->
                <div class="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
                    <h2 class="text-base font-semibold text-gray-800">پروفایل کاربری</h2>
                    <button
                        @click="visible = false"
                        class="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <IsIcon name="close" class="size-5" />
                    </button>
                </div>

                <!-- Avatar Section -->
                <div class="flex flex-col items-center pt-6 pb-4 px-5">
                    <div class="relative">
                        <div class="size-24 rounded-full overflow-hidden bg-gray-100 border-2 border-primary-200 flex items-center justify-center">
                            <img
                                v-if="avatarPreview"
                                :src="avatarPreview"
                                alt="avatar"
                                class="w-full h-full object-cover"
                            />
                            <IsIcon v-else name="user" class="size-10 text-gray-400" />
                        </div>
                        <label
                            class="absolute bottom-0 left-0 bg-primary-600 hover:bg-primary-700 text-white size-7 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                        >
                            <IsIcon name="camera" class="size-3.5" />
                            <input
                                type="file"
                                accept="image/*"
                                class="hidden"
                                @change="onAvatarChange"
                            />
                        </label>
                    </div>

                    <!-- User ID Badge -->
                    <div class="mt-3 flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                        <span class="font-medium text-gray-600">آیدی:</span>
                        <span dir="ltr" class="font-mono">{{ props.userId }}</span>
                    </div>
                </div>

                <!-- Form Fields -->
                <div class="px-5 pb-4 flex flex-col gap-4">
                    <AppInput
                        v-model="form.first_name"
                        label="نام"
                        name="first_name"
                        placeholder="نام خود را وارد کنید"
                        type="text"
                        :error="errors.first_name"
                    />
                    <AppInput
                        v-model="form.last_name"
                        label="نام خانوادگی"
                        name="last_name"
                        placeholder="نام خانوادگی خود را وارد کنید"
                        type="text"
                        :error="errors.last_name"
                    />
                </div>

                <!-- Actions -->
                <div class="flex gap-3 px-5 pb-5">
                    <button
                        @click="handleSave"
                        :disabled="isPending"
                        class="flex-1 h-10 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <span v-if="isPending" class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>ذخیره تغییرات</span>
                    </button>
                    <button
                        @click="handleLogout"
                        class="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                    >
                        <IsIcon name="logout" class="size-4" />
                        <span>خروج</span>
                    </button>
                </div>
            </div>
        </template>
    </AppModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUpdateUserProfile } from '@/api/user';
import { useJwtService } from '@/composables/useJwtService';
import type { IUserProfile } from '@/types/user';

const props = defineProps<{
    userId: number;
    profile: IUserProfile | undefined;
}>();

const visible = defineModel<boolean>('visible');
const router = useRouter();
const { remove } = useJwtService();
const { mutate: updateProfile, isPending } = useUpdateUserProfile();

const form = ref({ first_name: '', last_name: '' });
const errors = ref({ first_name: '', last_name: '' });
const avatarPreview = ref<string | null>(null);
const avatarFile = ref<File | null>(null);

watch(
    () => props.profile,
    (profile) => {
        if (profile) {
            form.value.first_name = profile.first_name ?? '';
            form.value.last_name = profile.last_name ?? '';
            avatarPreview.value = profile.avatar ?? null;
        }
    },
    { immediate: true }
);

function onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    avatarFile.value = file;
    avatarPreview.value = URL.createObjectURL(file);
}

function validate(): boolean {
    errors.value = { first_name: '', last_name: '' };
    if (!form.value.first_name.trim()) {
        errors.value.first_name = 'نام الزامی است';
        return false;
    }
    if (!form.value.last_name.trim()) {
        errors.value.last_name = 'نام خانوادگی الزامی است';
        return false;
    }
    return true;
}

function handleSave() {
    if (!validate()) return;
    updateProfile(
        { userId: props.userId, data: { first_name: form.value.first_name, last_name: form.value.last_name } },
        { onSuccess: () => { visible.value = false; } }
    );
}

function handleLogout() {
    remove();
    router.push({ name: 'Login' });
}
</script>
