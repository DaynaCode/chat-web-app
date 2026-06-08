import type { DefineComponent } from 'vue';

export type SvgComponent = DefineComponent<object, object, unknown>;

const modules = import.meta.glob<{ default: SvgComponent }>('@/assets/icons/*.svg', { eager: true });

const iconMap: Record<string, SvgComponent> = {};

for (const path in modules) {
  const filename = path.split('/').pop()?.replace('.svg', '');
  if (filename) {
    iconMap[filename] = modules[path].default;
  }
}

export default iconMap;
