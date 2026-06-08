<template>
    <AppModal v-model:visible="visible">
        <template #container>
            <div class="flex flex-col" dir="rtl">
                <!-- Header -->
                <div class="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
                    <h2 class="text-base font-semibold text-gray-800">پروفایل کاربری</h2>
                    <button @click="visible = false" class="text-gray-400 hover:text-gray-600 transition-colors">
                        <IsIcon name="close" class="size-5" />
                    </button>
                </div>

                <!-- Avatar -->
                <div class="flex flex-col items-center pt-6 pb-4 px-5">
                    <div class="relative">
                        <div class="size-24 rounded-full overflow-hidden bg-gray-100 border-2 border-primary-200 flex items-center justify-center">
                            <img v-if="avatarPreview" :src="avatarPreview" alt="avatar" class="w-full h-full object-cover" />
                            <IsIcon v-else name="user" class="size-10 text-gray-400" />
                        </div>
                        <label class="absolute bottom-0 left-0 bg-primary-600 hover:bg-primary-700 text-white size-7 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-sm">
                            <IsIcon name="camera" class="size-3.5" />
                            <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
                        </label>
                    </div>
                    <div class="mt-3 flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                        <span class="font-medium text-gray-600">نام کاربری:</span>
                        <span class="font-mono">{{ props.profile?.username }}</span>
                    </div>
                </div>

                <!-- Form -->
                <div class="px-5 pb-4 flex flex-col gap-4">
                    <AppInput
                        v-model="form.displayName"
                        label="نام نمایشی"
                        name="displayName"
                        placeholder="نام نمایشی خود را وارد کنید"
                        type="text"
                        :error="errors.displayName"
                    />
                    <AppInput
                        v-model="form.bio"
                        label="بیوگرافی"
                        name="bio"
                        placeholder="درباره خودتان بنویسید"
                        type="text"
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
                </div>
            </div>
        </template>
    </AppModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useUpdateUserProfile } from '@/api/user';
import type { IUserProfile } from '@/types/user';

const props = defineProps<{
    profile: IUserProfile | undefined;
}>();

const visible = defineModel<boolean>('visible');
const { mutate: updateProfile, isPending } = useUpdateUserProfile();

const form = ref({ displayName: '', bio: '' });
const errors = ref({ displayName: '' });
const avatarPreview = ref<string | null>(null);

watch(
    () => props.profile,
    (p) => {
        if (p) {
            form.value.displayName = p.displayName ?? '';
            form.value.bio = p.bio ?? '';
            avatarPreview.value = p.avatar ?? null;
        }
    },
    { immediate: true }
);

function onAvatarChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    avatarPreview.value = URL.createObjectURL(file);
}

function handleSave() {
    errors.value.displayName = '';
    if (!form.value.displayName.trim()) {
        errors.value.displayName = 'نام نمایشی الزامی است';
        return;
    }
    updateProfile(
        { displayName: form.value.displayName, bio: form.value.bio },
        { onSuccess: () => { visible.value = false; } }
    );
}
</script>
