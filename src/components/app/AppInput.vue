<template>
  <div>
    <label
        v-if="label"
        :for="inputId"
        class="text-sm font-medium text-neutral-700 block mb-1"
    >
      {{ label }}
      <span
          v-if="required"
          class="relative text-[8px] ] mr-0.5 text-rose-500"
      >*</span
      >
    </label>

    <IconField>
      <template v-if="type === 'text'">
        <InputText
            v-model="textValue"
            :inputId="inputId"
            :name="name"
            :placeholder="placeholder"
            :disabled="disabled"
            autocomplete="off"
            class="w-full"
            @blur="$emit('blur')"
        />
      </template>
      <template v-else-if="type === 'number'">
        <InputNumber
            v-model="numberValue"
            :inputId="inputId"
            :name="name"
            :placeholder="placeholder"
            :min="min"
            :locale="locale"
            :useGrouping="useGrouping"
            autocomplete="off"
            class="w-full"
            @blur="$emit('blur')"
        />
      </template>
      <template v-else>
        <Password v-model="textValue"
                  :inputId="inputId"
                  :name="name"
                  :placeholder="placeholder"
                  :disabled="disabled"
                  autocomplete="off"
                  class="w-full"
                  :feedback="false"
                  @blur="$emit('blur')"
                  toggleMask/>
      </template>
      <InputIcon>
        <slot name="icon"/>
      </InputIcon>
    </IconField>

    <Message
        v-if="error"
        severity="error"
        size="small"
        variant="simple"
        class="mt-2"
    >
      <template #icon>
        <IsIcon name="info" class="size-4"/>
      </template>
      {{ error }}
    </Message>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';

const props = defineProps<{
  modelValue: number | string | null;
  label?: string;
  required?: boolean;
  name?: string;
  placeholder?: string;
  min?: number;
  locale?: string;
  useGrouping?: boolean;
  inputId?: string;
  error?: string | null;
  type?: 'text' | 'number' | 'password'
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | string | null): void;
  (e: 'blur'): void;
}>();

const textValue = computed<string | null>({
  get: () =>
      typeof props.modelValue === 'string'
          ? props.modelValue
          : (props.modelValue?.toString() ?? null),
  set: (val) => emit('update:modelValue', val)
});

const numberValue = computed<number | null>({
  get: () =>
      typeof props.modelValue === 'number'
          ? props.modelValue
          : Number(props.modelValue) || null,
  set: (val) => emit('update:modelValue', val)
});


const min = props.min ?? 0;
const locale = props.locale ?? 'fa-IR';
const useGrouping = props.useGrouping ?? true;
const inputId = props.inputId ?? props.name ?? 'input';
</script>

<style>
:deep(.p-message-content) {
  gap: 4px !important;
  align-items: center;
}
</style>
